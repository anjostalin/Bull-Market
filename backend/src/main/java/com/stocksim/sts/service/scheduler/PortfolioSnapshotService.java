package com.stocksim.sts.service.scheduler;

import com.stocksim.sts.entity.PortfolioSnapshot;
import com.stocksim.sts.entity.User;
import com.stocksim.sts.repository.PortfolioSnapshotRepository;
import com.stocksim.sts.repository.UserRepository;
import com.stocksim.sts.service.PortfolioService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Captures each trader's net worth (holdings at market + wallet cash) at a fixed
 * cadence so the portfolio-value-over-time chart has data points (FR-09 / Section 10.5).
 */
@Component
public class PortfolioSnapshotService {

    private final UserRepository userRepository;
    private final PortfolioService portfolioService;
    private final PortfolioSnapshotRepository snapshotRepository;

    public PortfolioSnapshotService(UserRepository userRepository, PortfolioService portfolioService,
                                    PortfolioSnapshotRepository snapshotRepository) {
        this.userRepository = userRepository;
        this.portfolioService = portfolioService;
        this.snapshotRepository = snapshotRepository;
    }

    @Scheduled(fixedDelayString = "${sts.market.snapshot-interval-ms:60000}")
    @Transactional
    public void snapshot() {
        for (User user : userRepository.findAll()) {
            if (user.getRole() == User.Role.ADMIN) continue;
            try {
                BigDecimal value = portfolioService.netWorth(user.getId());
                snapshotRepository.save(PortfolioSnapshot.builder()
                        .userId(user.getId()).totalValue(value).build());
            } catch (Exception ignored) {
                // a user without a wallet yet (edge case) should not break the batch
            }
        }
    }
}
