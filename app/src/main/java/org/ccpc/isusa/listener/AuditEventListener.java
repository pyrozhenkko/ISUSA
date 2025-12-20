package org.ccpc.isusa.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.Log;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.repository.main.LogRepository;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component // Це Spring Bean
@RequiredArgsConstructor
public class AuditEventListener {

    private final LogRepository logRepository;

    @Async // Виконується в фоні
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW) // Створює окрему транзакцію для логу
    public void handleAuditEvent(AuditEvent event) {
        try {
            Log logEntry = Log.builder()
                    .user(event.getUser())
                    .level(event.getLevel())
                    .message(event.getMessage())
                    .entityType(event.getEntityType())
                    .entityId(event.getEntityId())
                    .build();

            logRepository.save(logEntry);

            log.info("AUDIT: [{}] {}", event.getLevel(), event.getMessage());

        } catch (Exception e) {
            log.error("Помилка при збереженні аудиту", e);
        }

    }
}