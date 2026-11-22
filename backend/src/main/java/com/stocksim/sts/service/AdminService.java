package com.stocksim.sts.service;

import com.stocksim.sts.dto.AdminDtos.*;
import com.stocksim.sts.entity.Notification;
import com.stocksim.sts.entity.Order;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.entity.User;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;
    private final StockRepository stockRepository;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository, OrderRepository orderRepository,
                        TradeRepository tradeRepository, StockRepository stockRepository,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
        this.stockRepository = stockRepository;
        this.notificationService = notificationService;
    }

    public List<AdminUserView> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserView(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(),
                        u.isVerified(), u.isSuspended(), u.getCreatedAt()))
                .toList();
    }

    @Transactional
    public AdminUserView setSuspended(Long userId, boolean suspended) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        if (u.getRole() == User.Role.ADMIN) throw ApiException.badRequest("Cannot suspend an admin");
        u.setSuspended(suspended);
        userRepository.save(u);
        if (suspended) {
            notificationService.create(userId, Notification.Type.ACCOUNT_SUSPENDED, "Your account has been suspended.");
        }
        return new AdminUserView(u.getId(), u.getFullName(), u.getEmail(), u.getRole().name(),
                u.isVerified(), u.isSuspended(), u.getCreatedAt());
    }

    @Transactional
    public Stock overridePrice(Long stockId, BigDecimal price) {
        if (price == null || price.signum() <= 0) throw ApiException.badRequest("Price must be positive");
        Stock s = stockRepository.findById(stockId)
                .orElseThrow(() -> ApiException.notFound("Stock not found"));
        s.setCurrentPrice(price);
        if (s.getDayHigh() == null || price.compareTo(s.getDayHigh()) > 0) s.setDayHigh(price);
        if (s.getDayLow() == null || price.compareTo(s.getDayLow()) < 0) s.setDayLow(price);
        return stockRepository.save(s);
    }

    public PlatformMetrics metrics() {
        long totalUsers = userRepository.count();
        long activeTraders = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TRADER && !u.isSuspended()).count();
        long totalOrders = orderRepository.count();
        long executed = orderRepository.countByStatus(Order.Status.EXECUTED);
        long pending = orderRepository.countByStatus(Order.Status.PENDING);
        BigDecimal volume = tradeRepository.totalRealTradeVolume();

        Map<String, Long> bySector = stockRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        s -> s.getSector() == null ? "Other" : s.getSector(), Collectors.counting()));
        List<SectorCount> sectorCounts = bySector.entrySet().stream()
                .map(e -> new SectorCount(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.count(), a.count()))
                .toList();

        return new PlatformMetrics(totalUsers, activeTraders, totalOrders, executed, pending, volume, sectorCounts);
    }
}
