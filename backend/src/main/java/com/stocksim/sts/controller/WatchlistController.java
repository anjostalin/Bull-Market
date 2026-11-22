package com.stocksim.sts.controller;

import com.stocksim.sts.dto.WatchlistDtos.*;
import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.WatchlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlists")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public List<WatchlistView> list() {
        return watchlistService.list(SecurityUtil.currentUserId());
    }

    @PostMapping
    public WatchlistView create(@RequestBody CreateWatchlistRequest req) {
        return watchlistService.create(SecurityUtil.currentUserId(), req.name());
    }

    @PostMapping("/{id}/items")
    public WatchlistView addItem(@PathVariable Long id, @RequestBody AddItemRequest req) {
        return watchlistService.addItem(SecurityUtil.currentUserId(), id, req.stockId());
    }

    @DeleteMapping("/{id}/items/{stockId}")
    public void removeItem(@PathVariable Long id, @PathVariable Long stockId) {
        watchlistService.removeItem(SecurityUtil.currentUserId(), id, stockId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        watchlistService.delete(SecurityUtil.currentUserId(), id);
    }
}
