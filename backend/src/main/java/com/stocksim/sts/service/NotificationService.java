package com.stocksim.sts.service;

import com.stocksim.sts.entity.Notification;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void create(Long userId, Notification.Type type, String message) {
        notificationRepository.save(Notification.builder()
                .userId(userId).type(type).message(message).isRead(false).build());
    }

    public Page<Notification> list(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markRead(Long userId, Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!n.getUserId().equals(userId)) throw ApiException.forbidden("Not your notification");
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }
}
