package com.stocksim.sts.controller;

import com.stocksim.sts.dto.PaperDtos.*;
import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.PaperTradingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paper")
public class PaperTradingController {

    private final PaperTradingService paperService;

    public PaperTradingController(PaperTradingService paperService) {
        this.paperService = paperService;
    }

    @GetMapping("/portfolio")
    public PaperPortfolio portfolio() {
        return paperService.portfolio(SecurityUtil.currentUserId());
    }

    @PostMapping("/trade")
    public PaperPortfolio trade(@Valid @RequestBody PaperOrderRequest req) {
        return paperService.trade(SecurityUtil.currentUserId(), req);
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntry> leaderboard() {
        return paperService.leaderboard();
    }
}
