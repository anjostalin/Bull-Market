package com.stocksim.sts.controller;

import com.stocksim.sts.dto.StockDtos.*;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.service.MarketClock;
import com.stocksim.sts.service.StockService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;
    private final MarketClock marketClock;

    public StockController(StockService stockService, MarketClock marketClock) {
        this.stockService = stockService;
        this.marketClock = marketClock;
    }

    /** Public market-open status for both exchanges (used by the login ticker and UI banners). */
    @GetMapping("/market-status")
    public Map<String, Boolean> marketStatus() {
        return Map.of(
                "IN", marketClock.isOpen(Stock.Market.IN),
                "US", marketClock.isOpen(Stock.Market.US));
    }

    @GetMapping
    public Page<StockView> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String market,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "symbol") String sortBy) {
        return stockService.list(search, market, PageRequest.of(page, size, Sort.by(sortBy)));
    }

    @GetMapping("/{id}")
    public StockView get(@PathVariable Long id) {
        return stockService.get(id);
    }

    @GetMapping("/{id}/history")
    public List<CandleView> history(@PathVariable Long id) {
        return stockService.history(id);
    }
}
