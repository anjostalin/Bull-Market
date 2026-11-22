package com.stocksim.sts.service.scheduler;

import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.entity.StockPriceHistory;
import com.stocksim.sts.repository.StockPriceHistoryRepository;
import com.stocksim.sts.repository.StockRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Aggregates intraday simulated ticks into one OHLCV row per stock per day
 * (Section 12.2 / 18.2). Runs frequently and upserts "today's" candle: open is
 * set once, high/low track extremes, close follows the latest price. This keeps
 * the candlestick chart populated without waiting for a real end-of-day boundary.
 */
@Component
public class OhlcvAggregationService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository historyRepository;

    public OhlcvAggregationService(StockRepository stockRepository,
                                   StockPriceHistoryRepository historyRepository) {
        this.stockRepository = stockRepository;
        this.historyRepository = historyRepository;
    }

    @Scheduled(fixedDelayString = "${sts.market.ohlcv-interval-ms:15000}")
    @Transactional
    public void aggregate() {
        LocalDate today = LocalDate.now();
        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            BigDecimal price = stock.getCurrentPrice();
            StockPriceHistory candle = historyRepository
                    .findByStockIdAndDate(stock.getId(), today)
                    .orElse(null);
            if (candle == null) {
                candle = StockPriceHistory.builder()
                        .stock(stock).date(today)
                        .open(price).high(price).low(price).close(price)
                        .volume(stock.getVolume())
                        .build();
            } else {
                if (price.compareTo(candle.getHigh()) > 0) candle.setHigh(price);
                if (price.compareTo(candle.getLow()) < 0) candle.setLow(price);
                candle.setClose(price);
                candle.setVolume(stock.getVolume());
            }
            historyRepository.save(candle);
        }
    }
}
