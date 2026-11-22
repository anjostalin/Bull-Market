package com.stocksim.sts.service.scheduler;

import com.stocksim.sts.dto.StockDtos.PriceUpdate;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.repository.StockRepository;
import com.stocksim.sts.service.AlertService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Simulated market engine. Every tick, each active stock's price takes a bounded random walk
 * (approximately ±0.5% to ±2% per update), matching FR-04 / Section 12.2 of the documentation.
 * After updating, it broadcasts price updates over STOMP (/topic/prices) and runs alert checks.
 */
@Component
public class PriceSimulatorService {

    private final StockRepository stockRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AlertService alertService;

    public PriceSimulatorService(StockRepository stockRepository,
                                 SimpMessagingTemplate messagingTemplate,
                                 AlertService alertService) {
        this.stockRepository = stockRepository;
        this.messagingTemplate = messagingTemplate;
        this.alertService = alertService;
    }

    @Scheduled(fixedDelayString = "${sts.market.tick-interval-ms:5000}")
    @Transactional
    public void tick() {
        List<Stock> stocks = stockRepository.findAll();
        List<PriceUpdate> updates = new ArrayList<>();
        for (Stock stock : stocks) {
            if (!stock.isActive()) continue;
            BigDecimal newPrice = nextPrice(stock.getCurrentPrice());
            stock.setCurrentPrice(newPrice);
            if (stock.getDayHigh() == null || newPrice.compareTo(stock.getDayHigh()) > 0) {
                stock.setDayHigh(newPrice);
            }
            if (stock.getDayLow() == null || newPrice.compareTo(stock.getDayLow()) < 0) {
                stock.setDayLow(newPrice);
            }
            stock.setVolume(stock.getVolume() + ThreadLocalRandom.current().nextLong(1_000, 50_000));

            BigDecimal changePercent = BigDecimal.ZERO;
            if (stock.getPreviousClose() != null && stock.getPreviousClose().signum() != 0) {
                changePercent = newPrice.subtract(stock.getPreviousClose())
                        .divide(stock.getPreviousClose(), 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            }
            updates.add(new PriceUpdate(stock.getId(), stock.getSymbol(), newPrice, changePercent));
        }
        stockRepository.saveAll(stocks);

        // Broadcast all price updates to subscribed clients
        messagingTemplate.convertAndSend("/topic/prices", updates);

        // Evaluate price alerts against the fresh prices
        alertService.evaluateAlerts(stocks);
    }

    private BigDecimal nextPrice(BigDecimal current) {
        // magnitude 0.5%..2%, random sign
        double magnitude = ThreadLocalRandom.current().nextDouble(0.005, 0.02);
        double sign = ThreadLocalRandom.current().nextBoolean() ? 1 : -1;
        BigDecimal factor = BigDecimal.valueOf(1 + sign * magnitude);
        BigDecimal next = current.multiply(factor).setScale(2, RoundingMode.HALF_UP);
        // floor at 1.00 so a stock never goes to zero/negative
        return next.compareTo(BigDecimal.ONE) < 0 ? BigDecimal.ONE : next;
    }
}
