package com.stocksim.sts.service;

import com.stocksim.sts.dto.StockDtos.*;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.StockPriceHistoryRepository;
import com.stocksim.sts.repository.StockRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class StockService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository historyRepository;
    private final MarketClock marketClock;

    public StockService(StockRepository stockRepository, StockPriceHistoryRepository historyRepository,
                        MarketClock marketClock) {
        this.stockRepository = stockRepository;
        this.historyRepository = historyRepository;
        this.marketClock = marketClock;
    }

    public Page<StockView> list(String search, String market, Pageable pageable) {
        String q = search == null ? "" : search.trim();
        if (market != null && !market.isBlank()) {
            Stock.Market m = Stock.Market.valueOf(market.trim().toUpperCase());
            return stockRepository.searchByMarket(m, q, pageable).map(this::toView);
        }
        Page<Stock> page = q.isBlank()
                ? stockRepository.findByActiveTrue(pageable)
                : stockRepository
                .findByActiveTrueAndSymbolContainingIgnoreCaseOrActiveTrueAndCompanyNameContainingIgnoreCase(
                        q, q, pageable);
        return page.map(this::toView);
    }

    public StockView get(Long id) {
        return toView(stockRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Stock not found")));
    }

    public List<CandleView> history(Long id) {
        if (!stockRepository.existsById(id)) throw ApiException.notFound("Stock not found");
        return historyRepository.findByStockIdOrderByDateAsc(id).stream()
                .map(h -> new CandleView(h.getDate(), h.getOpen(), h.getHigh(), h.getLow(), h.getClose(), h.getVolume()))
                .toList();
    }

    public StockView toView(Stock s) {
        BigDecimal changePercent = BigDecimal.ZERO;
        if (s.getPreviousClose() != null && s.getPreviousClose().signum() != 0) {
            changePercent = s.getCurrentPrice().subtract(s.getPreviousClose())
                    .divide(s.getPreviousClose(), 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        return new StockView(s.getId(), s.getSymbol(), s.getCompanyName(), s.getSector(),
                s.getCurrentPrice(), s.getPreviousClose(), s.getDayHigh(), s.getDayLow(),
                s.getVolume(), changePercent,
                s.getMarket().name(), s.getCurrency(), marketClock.isOpen(s.getMarket()));
    }
}
