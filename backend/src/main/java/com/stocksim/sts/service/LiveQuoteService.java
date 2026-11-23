package com.stocksim.sts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.stocksim.sts.dto.StockDtos.PriceUpdate;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.repository.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Fetches real quotes from Yahoo Finance and broadcasts them, replacing the random-walk
 * simulator as the live price source. Only markets that are currently open are fetched —
 * closed markets keep their last price (frozen). Any per-symbol fetch failure is swallowed
 * so the last known price is retained (safe fallback); the demo never shows blanks or errors.
 *
 * Uses the v8/chart endpoint per symbol (the v7/quote batch endpoint returns 401 without a crumb).
 */
@Service
public class LiveQuoteService {

    private static final Logger log = LoggerFactory.getLogger(LiveQuoteService.class);

    private final StockRepository stockRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AlertService alertService;
    private final MarketClock marketClock;

    private final RestClient yahoo = RestClient.builder()
            .baseUrl("https://query1.finance.yahoo.com/v8/finance/chart")
            .defaultHeader("User-Agent", "Mozilla/5.0")
            .build();

    public LiveQuoteService(StockRepository stockRepository, SimpMessagingTemplate messagingTemplate,
                            AlertService alertService, MarketClock marketClock) {
        this.stockRepository = stockRepository;
        this.messagingTemplate = messagingTemplate;
        this.alertService = alertService;
        this.marketClock = marketClock;
    }

    @Scheduled(fixedDelayString = "${sts.market.fetch-interval-ms:10000}")
    @Transactional
    public void fetchAll() {
        List<Stock> stocks = stockRepository.findAll();
        List<Stock> touched = new ArrayList<>();
        List<PriceUpdate> updates = new ArrayList<>();

        for (Stock stock : stocks) {
            if (!stock.isActive()) continue;
            boolean open = marketClock.isOpen(stock.getMarket());

            // Only fetch a fresh quote when that market is open; otherwise keep last price (frozen).
            if (open) {
                BigDecimal fetched = fetchPrice(stock);
                if (fetched != null) {
                    stock.setCurrentPrice(fetched);
                    if (stock.getDayHigh() == null || fetched.compareTo(stock.getDayHigh()) > 0) {
                        stock.setDayHigh(fetched);
                    }
                    if (stock.getDayLow() == null || fetched.compareTo(stock.getDayLow()) < 0) {
                        stock.setDayLow(fetched);
                    }
                    touched.add(stock);
                }
            }

            updates.add(new PriceUpdate(stock.getId(), stock.getSymbol(),
                    stock.getCurrentPrice(), changePercent(stock), open));
        }

        if (!touched.isEmpty()) stockRepository.saveAll(touched);

        // Broadcast every stock's latest price (open or frozen) so the UI always has current state.
        messagingTemplate.convertAndSend("/topic/prices", updates);

        // Alerts evaluate against the freshest prices.
        alertService.evaluateAlerts(stocks);
    }

    /** Returns the latest regularMarketPrice, or null on any failure (caller keeps last price). */
    private BigDecimal fetchPrice(Stock stock) {
        String sym = stock.getYahooSymbol();
        if (sym == null || sym.isBlank()) return null;
        try {
            JsonNode root = yahoo.get()
                    .uri("/{sym}?interval=1d&range=1d", sym)
                    .retrieve()
                    .body(JsonNode.class);
            JsonNode meta = root.path("chart").path("result").path(0).path("meta");
            JsonNode priceNode = meta.path("regularMarketPrice");
            if (priceNode.isMissingNode() || priceNode.isNull()) return null;
            BigDecimal price = BigDecimal.valueOf(priceNode.asDouble()).setScale(2, RoundingMode.HALF_UP);

            // Anchor change% to Yahoo's authoritative previous close (overwrites placeholder seed values).
            JsonNode prevNode = meta.path("chartPreviousClose");
            if (!prevNode.isMissingNode() && !prevNode.isNull()) {
                stock.setPreviousClose(BigDecimal.valueOf(prevNode.asDouble()).setScale(2, RoundingMode.HALF_UP));
            }
            return price.signum() > 0 ? price : null;
        } catch (Exception e) {
            log.warn("Live quote fetch failed for {} ({}): {}", stock.getSymbol(), sym, e.getMessage());
            return null;
        }
    }

    private BigDecimal changePercent(Stock stock) {
        BigDecimal prev = stock.getPreviousClose();
        if (prev == null || prev.signum() == 0) return BigDecimal.ZERO;
        return stock.getCurrentPrice().subtract(prev)
                .divide(prev, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
    }
}
