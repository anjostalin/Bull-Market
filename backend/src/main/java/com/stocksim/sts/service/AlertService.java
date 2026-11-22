package com.stocksim.sts.service;

import com.stocksim.sts.entity.Notification;
import com.stocksim.sts.entity.PriceAlert;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.entity.User;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.PriceAlertRepository;
import com.stocksim.sts.repository.StockRepository;
import com.stocksim.sts.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final PriceAlertRepository alertRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public AlertService(PriceAlertRepository alertRepository, StockRepository stockRepository,
                        UserRepository userRepository,
                        @Lazy NotificationService notificationService, EmailService emailService) {
        this.alertRepository = alertRepository;
        this.stockRepository = stockRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public PriceAlert create(Long userId, Long stockId, PriceAlert.Condition condition, BigDecimal threshold) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> ApiException.notFound("Stock not found"));
        return alertRepository.save(PriceAlert.builder()
                .userId(userId).stock(stock).condition(condition).threshold(threshold).active(true).build());
    }

    public List<PriceAlert> list(Long userId) {
        return alertRepository.findByUserId(userId);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        PriceAlert a = alertRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Alert not found"));
        if (!a.getUserId().equals(userId)) throw ApiException.forbidden("Not your alert");
        alertRepository.delete(a);
    }

    /**
     * Evaluates all active alerts against the freshest prices. Called from the price-simulator tick.
     * The stock list passed in is already price-updated; we index it to avoid re-reading the DB.
     */
    @Transactional
    public void evaluateAlerts(List<Stock> freshStocks) {
        List<PriceAlert> active = alertRepository.findAllActive();
        if (active.isEmpty()) return;

        Map<Long, BigDecimal> priceById = freshStocks.stream()
                .collect(Collectors.toMap(Stock::getId, Stock::getCurrentPrice, (a, b) -> a));

        for (PriceAlert alert : active) {
            BigDecimal price = priceById.get(alert.getStock().getId());
            if (price == null) continue;
            boolean hit = alert.getCondition() == PriceAlert.Condition.ABOVE
                    ? price.compareTo(alert.getThreshold()) >= 0
                    : price.compareTo(alert.getThreshold()) <= 0;
            if (hit) {
                alert.setActive(false);
                alert.setTriggeredAt(LocalDateTime.now());
                alertRepository.save(alert);

                String msg = String.format("%s is now %s %s (price ₹%s)",
                        alert.getStock().getSymbol(),
                        alert.getCondition() == PriceAlert.Condition.ABOVE ? "above" : "below",
                        alert.getThreshold(), price);
                notificationService.create(alert.getUserId(), Notification.Type.PRICE_ALERT, msg);
                userRepository.findById(alert.getUserId())
                        .ifPresent(u -> emailService.sendPriceAlert(u.getEmail(), msg));
            }
        }
    }
}
