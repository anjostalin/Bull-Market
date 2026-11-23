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
 * simulator as the live price source. Prices are always fetched (Yahoo serves the latest
 * price or the last close even when a market is closed), so the app always shows real,
 * correct numbers. The market-open flag is still reported so the UI can gate *trading*.
 * Any per-symbol fetch failure is swallowed so the last known price is retained (safe fallback).
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

            // Always fetch the real price (Yahoo returns the latest / last close even when closed),
            // so the app never shows stale seed prices. fetchPrice also sets the real day high/low.
            BigDecimal fetched = fetchPrice(stock);
            if (fetched != null) {
                stock.setCurrentPrice(fetched);
                touched.add(stock);
            }

            updates.add(new PriceUpdate(stock.getId(), stock.getSymbol(),
                    stock.getCurrentPrice(), changePercent(stock), marketClock.isOpen(stock.getMarket())));
        }

        if (!touched.isEmpty()) stockRepository.saveAll(touched);

        // Broadcast every stock's latest price so the UI always has current state.
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
            // Use Yahoo's authoritative day high/low so the range reflects reality
            // (not accumulated seed values). Fall back to the live price if absent.
            JsonNode hi = meta.path("regularMarketDayHigh");
            JsonNode lo = meta.path("regularMarketDayLow");
            stock.setDayHigh(!hi.isMissingNode() && !hi.isNull() && hi.asDouble() > 0
                    ? BigDecimal.valueOf(hi.asDouble()).setScale(2, RoundingMode.HALF_UP) : price);
            stock.setDayLow(!lo.isMissingNode() && !lo.isNull() && lo.asDouble() > 0
                    ? BigDecimal.valueOf(lo.asDouble()).setScale(2, RoundingMode.HALF_UP) : price);
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

    /**
     * Fetches ~1 year of real daily OHLC candles for a stock from Yahoo.
     * Returns an empty list on any failure (caller can fall back to stored history).
     * Each row: [epochDay(LocalDate), open, high, low, close, volume].
     */
    public List<Object[]> fetchDailyHistory(String yahooSymbol) {
        List<Object[]> out = new ArrayList<>();
        if (yahooSymbol == null || yahooSymbol.isBlank()) return out;
        try {
            JsonNode root = yahoo.get()
                    .uri("/{sym}?interval=1d&range=1y", yahooSymbol)
                    .retrieve()
                    .body(JsonNode.class);
            JsonNode result = root.path("chart").path("result").path(0);
            JsonNode ts = result.path("timestamp");
            JsonNode q = result.path("indicators").path("quote").path(0);
            JsonNode open = q.path("open"), high = q.path("high"), low = q.path("low"),
                    close = q.path("close"), vol = q.path("volume");
            for (int i = 0; i < ts.size(); i++) {
                if (close.path(i).isNull() || open.path(i).isNull()) continue;
                java.time.LocalDate date = java.time.Instant.ofEpochSecond(ts.path(i).asLong())
                        .atZone(java.time.ZoneId.of("UTC")).toLocalDate();
                out.add(new Object[]{
                        date,
                        bd(open.path(i)), bd(high.path(i)), bd(low.path(i)), bd(close.path(i)),
                        vol.path(i).isNull() ? 0L : vol.path(i).asLong()
                });
            }
        } catch (Exception e) {
            log.warn("History fetch failed for {}: {}", yahooSymbol, e.getMessage());
        }
        return out;
    }

    private BigDecimal bd(JsonNode n) {
        return BigDecimal.valueOf(n.asDouble()).setScale(2, RoundingMode.HALF_UP);
    }
}
