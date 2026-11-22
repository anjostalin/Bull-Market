package com.stocksim.sts.controller;

import com.stocksim.sts.dto.AdminDtos.*;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<AdminUserView> users() {
        return adminService.listUsers();
    }

    @PutMapping("/users/{id}/suspend")
    public AdminUserView suspend(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return adminService.setSuspended(id, body.getOrDefault("suspended", true));
    }

    @PostMapping("/price-override")
    public Stock overridePrice(@RequestBody PriceOverrideRequest req) {
        return adminService.overridePrice(req.stockId(), req.price());
    }

    @GetMapping("/metrics")
    public PlatformMetrics metrics() {
        return adminService.metrics();
    }
}
