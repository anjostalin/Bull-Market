package com.stocksim.sts.service;

import com.stocksim.sts.dto.SignalDtos.SignalView;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.entity.StockPriceHistory;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.StockPriceHistoryRepository;
import com.stocksim.sts.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Rule-based technical analysis (Section 10.8 / FR-13). Computes SMA-7, SMA-14 and RSI-14
 * from stored daily closes and maps them to a deterministic signal, plus a 1-10 volatility
 * risk score. These are deterministic rule-based signals, not ML predictions or financial advice.
 */
@Service
public class SignalService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository historyRepository;

    public SignalService(StockRepository stockRepository, StockPriceHistoryRepository historyRepository) {
        this.stockRepository = stockRepository;
        this.historyRepository = historyRepository;
    }

    public SignalView compute(Long stockId) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> ApiException.notFound("Stock not found"));

        List<StockPriceHistory> history = historyRepository.findByStockIdOrderByDateAsc(stockId);
        List<BigDecimal> closes = history.stream().map(StockPriceHistory::getClose).toList();

        // If not enough stored candles yet, fall back to the current price so the endpoint is always useful.
        BigDecimal current = stock.getCurrentPrice();
        BigDecimal sma7 = sma(closes, 7, current);
        BigDecimal sma14 = sma(closes, 14, current);
        BigDecimal rsi = rsi(closes, 14);
        int risk = riskScore(closes);

        String signal = classify(current, sma7, sma14, rsi);
        String rationale = String.format("RSI=%.1f, price vs SMA7 %s, SMA14 %s",
                rsi, cmp(current, sma7), cmp(current, sma14));

        return new SignalView(stock.getId(), stock.getSymbol(), current, sma7, sma14, rsi, signal, risk, rationale);
    }

    private String cmp(BigDecimal price, BigDecimal sma) {
        int c = price.compareTo(sma);
        return c > 0 ? "above" : c < 0 ? "below" : "equal";
    }

    private BigDecimal sma(List<BigDecimal> closes, int period, BigDecimal fallback) {
        if (closes.size() < period) {
            if (closes.isEmpty()) return fallback;
            // average of whatever we have
            BigDecimal sum = closes.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            return sum.divide(BigDecimal.valueOf(closes.size()), 2, RoundingMode.HALF_UP);
        }
        List<BigDecimal> window = closes.subList(closes.size() - period, closes.size());
        BigDecimal sum = window.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(period), 2, RoundingMode.HALF_UP);
    }

    /** Classic RSI over the given period. Returns 50 (neutral) when insufficient data. */
    private BigDecimal rsi(List<BigDecimal> closes, int period) {
        if (closes.size() < period + 1) return BigDecimal.valueOf(50);
        BigDecimal gain = BigDecimal.ZERO, loss = BigDecimal.ZERO;
        int start = closes.size() - period;
        for (int i = start; i < closes.size(); i++) {
            BigDecimal diff = closes.get(i).subtract(closes.get(i - 1));
            if (diff.signum() > 0) gain = gain.add(diff);
            else loss = loss.add(diff.abs());
        }
        if (loss.signum() == 0) return BigDecimal.valueOf(100);
        BigDecimal avgGain = gain.divide(BigDecimal.valueOf(period), 6, RoundingMode.HALF_UP);
        BigDecimal avgLoss = loss.divide(BigDecimal.valueOf(period), 6, RoundingMode.HALF_UP);
        BigDecimal rs = avgGain.divide(avgLoss, 6, RoundingMode.HALF_UP);
        BigDecimal rsi = BigDecimal.valueOf(100).subtract(
                BigDecimal.valueOf(100).divide(BigDecimal.ONE.add(rs), 6, RoundingMode.HALF_UP));
        return rsi.setScale(2, RoundingMode.HALF_UP);
    }

    private String classify(BigDecimal price, BigDecimal sma7, BigDecimal sma14, BigDecimal rsi) {
        double r = rsi.doubleValue();
        boolean aboveS7 = price.compareTo(sma7) > 0;
        boolean aboveS14 = price.compareTo(sma14) > 0;
        if (r < 30 && aboveS7) return "STRONG_BUY";
        if (r < 45 && aboveS14) return "BUY";
        if (r > 70 && !aboveS7) return "STRONG_SELL";
        if (r > 55 && !aboveS14) return "SELL";
        return "HOLD";
    }

    /** Volatility risk score 1..10 from the coefficient of variation of the last 14 closes. */
    private int riskScore(List<BigDecimal> closes) {
        int period = Math.min(14, closes.size());
        if (period < 2) return 1;
        List<BigDecimal> window = closes.subList(closes.size() - period, closes.size());
        double mean = window.stream().mapToDouble(BigDecimal::doubleValue).average().orElse(0);
        if (mean == 0) return 1;
        double variance = window.stream()
                .mapToDouble(c -> Math.pow(c.doubleValue() - mean, 2)).average().orElse(0);
        double cv = (Math.sqrt(variance) / mean) * 100; // coefficient of variation %
        int score = (int) Math.round(cv);              // ~1% CV -> 1, clamp to [1,10]
        return Math.max(1, Math.min(10, score));
    }
}
