package com.stocksim.sts.controller;

import com.stocksim.sts.entity.NewsArticle;
import com.stocksim.sts.repository.NewsArticleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
public class NewsController {

    private final NewsArticleRepository newsRepository;

    public NewsController(NewsArticleRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @GetMapping("/{id}/news")
    public List<Map<String, Object>> news(@PathVariable Long id) {
        return newsRepository.findByStockId(id).stream().limit(5)
                .map(n -> Map.<String, Object>of(
                        "id", n.getId(),
                        "headline", n.getHeadline(),
                        "body", n.getBody() == null ? "" : n.getBody(),
                        "sentiment", n.getSentiment().name(),
                        "publishedAt", n.getPublishedAt()))
                .toList();
    }
}
