package com.stocksim.sts.controller;

import com.stocksim.sts.entity.Wallet;
import com.stocksim.sts.entity.WalletTransaction;
import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public Wallet get() {
        return walletService.getByUser(SecurityUtil.currentUserId());
    }

    @GetMapping("/transactions")
    public Page<WalletTransaction> transactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return walletService.transactions(SecurityUtil.currentUserId(), PageRequest.of(page, size));
    }

    @PostMapping("/deposit")
    public Wallet deposit(@RequestBody Map<String, BigDecimal> body) {
        return walletService.deposit(SecurityUtil.currentUserId(), body.get("amount"));
    }

    @PostMapping("/withdraw")
    public Wallet withdraw(@RequestBody Map<String, BigDecimal> body) {
        return walletService.withdraw(SecurityUtil.currentUserId(), body.get("amount"));
    }
}
