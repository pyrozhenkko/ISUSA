package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.dto.response.ApplicationVerificationResponseDto;
import org.ccpc.isusa.entity.main.Application;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.repository.main.ApplicationRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final ApplicationRepository applicationRepository;
    private final SignatureService signatureService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public ApplicationVerificationResponseDto verifyApplicationIntegrity(Integer applicationId, User performer) {

        // 1. Пошук заявки (з логуванням помилки, якщо не знайдено)
        Application app = applicationRepository.findById(applicationId)
                .orElse(null);

        if (app == null) {
            // Безпека: хтось намагається перевірити неіснуючу заявку
            publishAudit(performer, "WARN", "Спроба верифікації неіснуючої заявки", "Application", applicationId);
            throw new EntityNotFoundException("Заявку з ID " + applicationId + " не знайдено.");
        }

        // 2. Перевірка наявності підпису
        if (app.getSignature() == null || app.getDataToSign() == null || app.getContentHash() == null) {
            publishAudit(performer, "WARN", "Спроба перевірки непідписаної заявки", "Application", applicationId);
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(false)
                    .message("Помилка: Ця заявка не була підписана.")
                    .build();
        }

        // --- 3. ПЕРЕВІРКА ЦІЛІСНОСТІ КОНТЕНТУ ---
        String currentContentHash = signatureService.hashData(app.getContent());
        boolean isContentIntact = currentContentHash.equals(app.getContentHash());

        if (!isContentIntact) {
            publishAudit(performer, "ERROR", "КРИТИЧНО: Контент заявки змінено після підписання!", "Application", applicationId);
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(false)
                    .message("ПОПЕРЕДЖЕННЯ: Зміст (content) заявки було змінено ПІСЛЯ підписання!")
                    .build();
        }

        // --- 4. ПЕРЕВІРКА КРИПТОГРАФІЧНОГО ПІДПИСУ ---
        boolean isSignatureValid = signatureService.verify(app.getDataToSign(), app.getSignature());

        if (!isSignatureValid) {
            publishAudit(performer, "SECURITY", "КРИТИЧНО: Невалідний цифровий підпис! Дані скомпрометовані.", "Application", applicationId);
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(true)
                    .message("КРИТИЧНА ПОМИЛКА: Підпис (signature) не валідний!")
                    .build();
        }

        // --- 5. УСПІХ ---
        // Парсинг метаданих
        String[] parts = app.getDataToSign().split("&");
        Integer studentId = Integer.parseInt(parts[0].split("=")[1]);
        long timestamp = Long.parseLong(parts[3].split("=")[1]);
        LocalDateTime signedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneOffset.UTC);

        publishAudit(performer, "INFO", "Успішна перевірка цілісності заявки", "Application", applicationId);

        return ApplicationVerificationResponseDto.builder()
                .isSignatureValid(true)
                .isContentIntact(true)
                .message("УСПІХ: Підпис валідний. Цілісність даних підтверджена.")
                .signedAt(signedAt)
                .studentId(studentId)
                .build();
    }

    /**
     * Універсальний метод для публікації аудиту.
     * Якщо performer == null, це вважається системною дією.
     */
    private void publishAudit(User user, String level, String message, String entityType, Integer entityId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                level,
                message,
                entityType,
                entityId
        ));
    }
}