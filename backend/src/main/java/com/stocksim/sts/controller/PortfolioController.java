package com.stocksim.sts.controller;

import com.stocksim.sts.dto.PortfolioDtos.*;
import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.PortfolioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public PortfolioSummary summary() {
        return portfolioService.summary(SecurityUtil.currentUserId());
    }

    @GetMapping("/history")
    public List<SnapshotPoint> history(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "INR") String currency) {
        return portfolioService.history(SecurityUtil.currentUserId(), days, currency);
    }
}
