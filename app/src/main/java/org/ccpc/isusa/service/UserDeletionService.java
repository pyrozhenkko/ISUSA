package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.repository.UserRepository;
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

    /**
     * Soft-delete: логічне видалення користувача
     * Замість DELETE, ми UPDATE запис, встановлюючи is_deleted = true
     */
    @Transactional
    public void softDeleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено"));

        if (user.getIsDeleted()) {
            log.warn("Користувач вже видален: {}", user.getUsername());
            throw new IllegalStateException("Користувач вже видален");
        }

        // Помічаємо як видаленого
        user.setIsDeleted(true);
        user.setDeletedDate(LocalDateTime.now());
        user.setIsActive(false); // Також деактивуємо

        userRepository.save(user);
        log.info("Користувач soft-deleted: {} (ID: {})", user.getUsername(), userId);
    }

    /**
     * Відновлення видаленого користувача
     */
    @Transactional
    public void restoreDeletedUser(Integer userId) {
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
}

