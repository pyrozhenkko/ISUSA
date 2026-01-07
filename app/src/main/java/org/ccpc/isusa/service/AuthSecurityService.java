package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.repository.main.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Сервіс для управління безпекою аутентифікації.
 * Захищає від brute-force атак та ведення логів вхідних спроб.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthSecurityService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Конфігурація
    @Value("${isusa.security.max-failed-attempts:5}")
    private Integer maxFailedAttempts;

    @Value("${isusa.security.lock-duration-minutes:15}")
    private Integer lockDurationMinutes;

    /**
     * Перевіряє, чи акаунт заблокований
     */
    public boolean isAccountLocked(User user) {
        if (user.getAccountLockedUntil() == null) {
            return false;
        }

        if (LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
            log.warn("Акаунт заблокований: {}", user.getUsername());
            // Лог "Відмова у вході" вже пишеться у AuthService, тому тут дублювати не треба
            return true;
        }

        // Час блокування закінчився - розблокуємо
        user.setAccountLockedUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        log.info("Акаунт розблокований: {}", user.getUsername());

        // ЛОГ: Автоматичне розблокування акаунту
        publishAudit(user, "INFO", "Акаунт автоматично розблокований після завершення терміну блокування", user.getUserId());
        return false;
    }

    /**
     * Реєструє невдалу спробу входу
     */
    @Transactional
    public void recordFailedLogin(User user) {
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

        log.warn("Невдала спроба входу для {}: {} спроб(и)",
                user.getUsername(),
                user.getFailedLoginAttempts());

        // ЛОГ: Попередження про невдалий вхід
        publishAudit(user, "WARN", "Невдала спроба входу. Спроба №" + user.getFailedLoginAttempts(), user.getUserId());

        // Якщо перевищено максимум спроб - блокуємо
        if (user.getFailedLoginAttempts() >= maxFailedAttempts) {
            user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(lockDurationMinutes));
            log.error("Акаунт заблокований на {} хвилин: {}",
                    lockDurationMinutes,
                    user.getUsername());

            // ЛОГ: КРИТИЧНО - Блокування акаунту (Brute-force protection)
            publishAudit(user, "SECURITY", "АКАУНТ ЗАБЛОКОВАНО на " + lockDurationMinutes + " хв через перевищення ліміту спроб", user.getUserId());
        }

        userRepository.save(user);
    }

    /**
     * Реєструє успішний вхід
     */
    @Transactional
    public void recordSuccessfulLogin(User user) {
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        user.setLastLoginDate(LocalDateTime.now());

        log.info("Успішний вхід: {}", user.getUsername());
        userRepository.save(user);

        // ЛОГ: Успішна аутентифікація
        publishAudit(user, "INFO", "Успішний вхід у систему", user.getUserId());
    }

    /**
     * Примушує користувача змінити пароль при наступному входові
     * (якщо пароль не змінювався більше 90 днів)
     */
    public boolean isPasswordExpired(User user) {
        if (user.getPasswordChangedDate() == null) {
            return true;
        }

        LocalDateTime expiryDate = user.getPasswordChangedDate().plusDays(90);
        return LocalDateTime.now().isAfter(expiryDate);
    }

    /**
     * Оновлює дату змінення пароля
     */
    @Transactional
    public void updatePasswordChangedDate(User user) {
        user.setPasswordChangedDate(LocalDateTime.now());
        userRepository.save(user);
        log.info("Пароль оновлений для: {}", user.getUsername());

        // ЛОГ: Зміна пароля (Критична подія безпеки)
        publishAudit(user, "SECURITY", "Користувач успішно змінив пароль", user.getUserId());
    }

    /**
     * Допоміжний метод для надсилання подій аудиту
     */
    private void publishAudit(User user, String level, String message, Integer userId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                level,
                message,
                "User", // Тип сутності
                userId
        ));
    }
}