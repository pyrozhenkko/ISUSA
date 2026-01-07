package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.repository.main.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDeletionService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Soft-delete: логічне видалення користувача
     */
    @Transactional
    public void softDeleteUser(Integer userId, User performer) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            publishAudit(performer, "WARN", "Спроба видалення неіснуючого користувача", userId);
            throw new EntityNotFoundException("Користувача з ID " + userId + " не знайдено");
        }

        if (Boolean.TRUE.equals(user.getIsDeleted())) { // Null-safe check
            log.warn("Користувач вже видалений: {}", user.getUsername());
            publishAudit(performer, "WARN", "Спроба видалити вже видаленого користувача: " + user.getUsername(), userId);
            throw new IllegalStateException("Користувач вже видалений");
        }

        // Помічаємо як видаленого
        user.setIsDeleted(true);
        user.setDeletedDate(LocalDateTime.now());
        user.setIsActive(false);

        userRepository.save(user);
        log.info("Користувач soft-deleted: {} (ID: {})", user.getUsername(), userId);

        publishAudit(performer, "INFO", "Користувача переведено у статус 'Видалений' (soft-delete): " + user.getUsername(), userId);
    }

    /**
     * Відновлення видаленого користувача
     */
    @Transactional
    public void restoreDeletedUser(Integer userId, User performer) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            publishAudit(performer, "WARN", "Спроба відновлення неіснуючого користувача", userId);
            throw new EntityNotFoundException("Користувача з ID " + userId + " не знайдено");
        }

        if (!Boolean.TRUE.equals(user.getIsDeleted())) {
            log.warn("Спроба відновити активного користувача: {}", user.getUsername());
            // Додано лог в аудит
            publishAudit(performer, "WARN", "Спроба відновлення користувача, який не був видалений: " + user.getUsername(), userId);
            throw new IllegalStateException("Користувач не видалений");
        }

        user.setIsDeleted(false);
        user.setDeletedDate(null);
        user.setIsActive(true);

        userRepository.save(user);
        log.info("Користувач відновлений: {} (ID: {})", user.getUsername(), userId);

        publishAudit(performer, "INFO", "Користувача успішно відновлено: " + user.getUsername(), userId);
    }

    public boolean isUserDeleted(User user) {
        return Boolean.TRUE.equals(user.getIsDeleted());
    }

    public User getDeletedUserById(Integer userId) {
        return userRepository.findById(userId)
                .filter(this::isUserDeleted)
                .orElseThrow(() -> new EntityNotFoundException("Видаленого користувача не знайдено"));
    }

    private void publishAudit(User performer, String level, String message, Integer targetUserId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                performer,
                level,
                message,
                "User", // EntityType
                targetUserId // EntityId
        ));
    }
}