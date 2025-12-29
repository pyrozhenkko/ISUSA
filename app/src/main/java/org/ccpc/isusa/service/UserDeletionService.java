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

/**
 * Сервіс для управління видаленням користувачів.
 * Використовує soft-delete (логічне видалення) замість фізичного.
 *
 * Переваги:
 * - Зберігаємо дані для аудиту (історія операцій)
 * - Не порушуємо референційну цілісність (заявки, логи, тощо)
 * - Можемо відновити користувача
 * - Відповідність GDPR (мінімум 3 роки зберігання)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDeletionService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Soft-delete: логічне видалення користувача
     * Замість DELETE, ми UPDATE запис, встановлюючи is_deleted = true
     */
    @Transactional
    public void softDeleteUser(Integer userId, User performer) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено"));

        if (user.getIsDeleted()) {
            log.warn("Користувач вже видален: {}", user.getUsername());
            // ЛОГ: Спроба повторного видалення (може бути помилкою інтерфейсу)
            publishAudit(performer, "WARN", "Спроба видалити вже видаленого користувача: " + user.getUsername(), userId);
            throw new IllegalStateException("Користувач вже видален");
        }

        // Помічаємо як видаленого
        user.setIsDeleted(true);
        user.setDeletedDate(LocalDateTime.now());
        user.setIsActive(false); // Також деактивуємо

        userRepository.save(user);
        log.info("Користувач soft-deleted: {} (ID: {})", user.getUsername(), userId);
        // 2. ЛОГ: Успішне логічне видалення
        publishAudit(performer, "INFO", "Користувача переведено у статус 'Видалений' (soft-delete): " + user.getUsername(), userId);
    }

    /**
     * Відновлення видаленого користувача
     */
    @Transactional
    public void restoreDeletedUser(Integer userId, User performer) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено"));

        if (!user.getIsDeleted()) {
            log.warn("Користувач не видален: {}", user.getUsername());
            throw new IllegalStateException("Користувач не видален");
        }

        user.setIsDeleted(false);
        user.setDeletedDate(null);
        user.setIsActive(true);

        userRepository.save(user);
        log.info("Користувач відновлений: {} (ID: {})", user.getUsername(), userId);

        // 3. ЛОГ: Успішне відновлення
        publishAudit(performer, "INFO", "Користувача успішно відновлено: " + user.getUsername(), userId);
    }

    /**
     * Перевіряє, чи користувач видален
     */
    public boolean isUserDeleted(User user) {
        return user.getIsDeleted() != null && user.getIsDeleted();
    }

    /**
     * Отримати видаленого користувача за ID
     * (Для адміністративних цілей)
     */
    public User getDeletedUserById(Integer userId) {
        return userRepository.findById(userId)
                .filter(this::isUserDeleted)
                .orElseThrow(() -> new EntityNotFoundException("Видаленого користувача не знайдено"));
    }

    /**
     * Допоміжний метод для надсилання подій аудиту
     */
    private void publishAudit(User performer, String level, String message, Integer targetUserId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,           // source
                performer,      // хто видалив
                level,          // INFO/WARN
                message,        // Опис дії
                "User",         // Тип сутності
                targetUserId    // ID видаленого користувача
        ));
    }
}

