package com.stocksim.sts.controller;

import com.stocksim.sts.dto.OrderDtos.*;
import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TRADER','ADMIN')")
    public OrderView place(@Valid @RequestBody PlaceOrderRequest req, HttpServletRequest http) {
        return orderService.place(SecurityUtil.currentUserId(), req, http.getRemoteAddr());
    }

    @GetMapping
    public Page<OrderView> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.listForUser(SecurityUtil.currentUserId(), PageRequest.of(page, size));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRADER','ADMIN')")
    public OrderView cancel(@PathVariable Long id) {
        return orderService.cancel(SecurityUtil.currentUserId(), id);
    }
}
