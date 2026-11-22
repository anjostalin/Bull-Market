package com.stocksim.sts.service;

import com.stocksim.sts.dto.WatchlistDtos.*;
import com.stocksim.sts.entity.Stock;
import com.stocksim.sts.entity.Watchlist;
import com.stocksim.sts.entity.WatchlistItem;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.StockRepository;
import com.stocksim.sts.repository.WatchlistItemRepository;
import com.stocksim.sts.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class WatchlistService {

    private static final int MAX_WATCHLISTS = 5;
    private static final int MAX_ITEMS = 20;

    private final WatchlistRepository watchlistRepository;
    private final WatchlistItemRepository itemRepository;
    private final StockRepository stockRepository;

    public WatchlistService(WatchlistRepository watchlistRepository, WatchlistItemRepository itemRepository,
                            StockRepository stockRepository) {
        this.watchlistRepository = watchlistRepository;
        this.itemRepository = itemRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional
    public WatchlistView create(Long userId, String name) {
        if (watchlistRepository.countByUserId(userId) >= MAX_WATCHLISTS) {
            throw ApiException.badRequest("Maximum " + MAX_WATCHLISTS + " watchlists allowed");
        }
        Watchlist wl = watchlistRepository.save(Watchlist.builder()
                .userId(userId).name(name == null || name.isBlank() ? "My Watchlist" : name).build());
        return new WatchlistView(wl.getId(), wl.getName(), List.of());
    }

    public List<WatchlistView> list(Long userId) {
        return watchlistRepository.findByUserId(userId).stream()
                .map(wl -> new WatchlistView(wl.getId(), wl.getName(), items(wl.getId())))
                .toList();
    }

    @Transactional
    public WatchlistView addItem(Long userId, Long watchlistId, Long stockId) {
        Watchlist wl = owned(userId, watchlistId);
        if (itemRepository.countByWatchlistId(watchlistId) >= MAX_ITEMS) {
            throw ApiException.badRequest("Maximum " + MAX_ITEMS + " stocks per watchlist");
        }
        if (itemRepository.findByWatchlistIdAndStockId(watchlistId, stockId).isEmpty()) {
            Stock stock = stockRepository.findById(stockId)
                    .orElseThrow(() -> ApiException.notFound("Stock not found"));
            itemRepository.save(WatchlistItem.builder().watchlistId(watchlistId).stock(stock).build());
        }
        return new WatchlistView(wl.getId(), wl.getName(), items(watchlistId));
    }

    @Transactional
    public void removeItem(Long userId, Long watchlistId, Long stockId) {
        owned(userId, watchlistId);
        itemRepository.findByWatchlistIdAndStockId(watchlistId, stockId)
                .ifPresent(itemRepository::delete);
    }

    @Transactional
    public void delete(Long userId, Long watchlistId) {
        owned(userId, watchlistId);
        itemRepository.findByWatchlistId(watchlistId).forEach(itemRepository::delete);
        watchlistRepository.deleteById(watchlistId);
    }

    private Watchlist owned(Long userId, Long watchlistId) {
        Watchlist wl = watchlistRepository.findById(watchlistId)
                .orElseThrow(() -> ApiException.notFound("Watchlist not found"));
        if (!wl.getUserId().equals(userId)) throw ApiException.forbidden("Not your watchlist");
        return wl;
    }

    private List<WatchlistItemView> items(Long watchlistId) {
        return itemRepository.findByWatchlistId(watchlistId).stream().map(i -> {
            Stock s = i.getStock();
            BigDecimal changePct = BigDecimal.ZERO;
            if (s.getPreviousClose() != null && s.getPreviousClose().signum() != 0) {
                changePct = s.getCurrentPrice().subtract(s.getPreviousClose())
                        .divide(s.getPreviousClose(), 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            }
            return new WatchlistItemView(i.getId(), s.getId(), s.getSymbol(), s.getCompanyName(),
                    s.getCurrentPrice(), changePct);
        }).toList();
    }
}
