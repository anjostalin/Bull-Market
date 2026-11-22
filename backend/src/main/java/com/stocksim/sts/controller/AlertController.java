package com.stocksim.sts.controller;

import com.stocksim.sts.dto.WatchlistDtos.*;
import com.stocksim.sts.entity.PriceAlert;
import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.AlertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<AlertView> list() {
        return alertService.list(SecurityUtil.currentUserId()).stream().map(this::toView).toList();
    }

    @PostMapping
    public AlertView create(@RequestBody CreateAlertRequest req) {
        PriceAlert a = alertService.create(SecurityUtil.currentUserId(),
                req.stockId(), req.condition(), req.threshold());
        return toView(a);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        alertService.delete(SecurityUtil.currentUserId(), id);
    }

    private AlertView toView(PriceAlert a) {
        return new AlertView(a.getId(), a.getStock().getId(), a.getStock().getSymbol(),
                a.getCondition().name(), a.getThreshold(), a.isActive(), a.getTriggeredAt(), a.getCreatedAt());
    }
}
