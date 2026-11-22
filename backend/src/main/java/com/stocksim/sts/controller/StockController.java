package com.stocksim.sts.controller;

import com.stocksim.sts.dto.StockDtos.*;
import com.stocksim.sts.service.StockService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    public Page<StockView> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "symbol") String sortBy) {
        return stockService.list(search, PageRequest.of(page, size, Sort.by(sortBy)));
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
