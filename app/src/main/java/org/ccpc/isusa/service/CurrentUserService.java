package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.repository.main.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CurrentUserService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public User getCurrentUser(UserDetails principal) {
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> {
                    String username = principal.getUsername();

                    // 1. Системний лог
                    log.error("CRITICAL SECURITY: User '{}' exists in SecurityContext but NOT in Database!", username);

                    // 2. Аудит: Це інцидент безпеки.
                    // User = null, бо ми його не знайшли в базі.
                    publishAudit("SECURITY", "КРИТИЧНО: Розсинхронізація сесії! Користувач '" + username + "' має валідний токен, але відсутній в базі даних.");

                    return new RuntimeException("Current user not found");
                });
    }

    private void publishAudit(String level, String message) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                null, // Ми не можемо передати User Entity, бо ми його не знайшли!
                level,
                message,
                "Security_Context",
                null
        ));
    }
}