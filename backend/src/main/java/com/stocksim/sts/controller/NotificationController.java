package com.stocksim.sts.controller;

import com.stocksim.sts.entity.Notification;
import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Page<Notification> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.list(SecurityUtil.currentUserId(), PageRequest.of(page, size));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", notificationService.unreadCount(SecurityUtil.currentUserId()));
    }

    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        notificationService.markRead(SecurityUtil.currentUserId(), id);
    }

    @PutMapping("/read-all")
    public void markAllRead() {
        notificationService.markAllRead(SecurityUtil.currentUserId());
    }
}
