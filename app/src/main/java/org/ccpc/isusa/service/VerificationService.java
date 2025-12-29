package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.dto.response.ApplicationVerificationResponseDto;
import org.ccpc.isusa.entity.main.Application;
import org.ccpc.isusa.entity.main.User; // Додано для аудиту
import org.ccpc.isusa.event.AuditEvent; // Твоя подія
import org.ccpc.isusa.repository.main.ApplicationRepository;
import org.springframework.context.ApplicationEventPublisher; // Паблішер
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
    private final ApplicationEventPublisher eventPublisher; // 1. Ін'єкція паблішера

    @Transactional(readOnly = true)
    public ApplicationVerificationResponseDto verifyApplicationIntegrity(Integer applicationId, User performer) {

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Заявку з ID " + applicationId + " не знайдено."));

        // 1. Перевірка наявності підпису
        if (app.getSignature() == null || app.getDataToSign() == null || app.getContentHash() == null) {
            publishAudit(performer, "WARN", "Спроба перевірки непідписаної заявки", applicationId);
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(false)
                    .message("Помилка: Ця заявка не була підписана.")
                    .build();
        }

        // --- 2. ПЕРЕВІРКА ЦІЛІСНОСТІ КОНТЕНТУ ---
        String currentContentHash = signatureService.hashData(app.getContent());
        boolean isContentIntact = currentContentHash.equals(app.getContentHash());

        if (!isContentIntact) {
            // ЛОГ: Спроба підміни контенту
            publishAudit(performer, "ERROR", "КРИТИЧНО: Контент заявки змінено після підписання!", applicationId);
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(false)
                    .message("ПОПЕРЕДЖЕННЯ: Зміст (content) заявки було змінено ПІСЛЯ підписання!")
                    .build();
        }

        // --- 3. ПЕРЕВІРКА КРИПТОГРАФІЧНОГО ПІДПИСУ ---
        boolean isSignatureValid = signatureService.verify(app.getDataToSign(), app.getSignature());

        if (!isSignatureValid) {
            // ЛОГ: Спроба фальсифікації підпису
            publishAudit(performer, "SECURITY", "КРИТИЧНО: Невалідний цифровий підпис! Дані підпису скомпрометовані.", applicationId);
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(true)
                    .message("КРИТИЧНА ПОМИЛКА: Підпис (signature) не валідний!")
                    .build();
        }

        // --- 4. УСПІХ ---
        String[] parts = app.getDataToSign().split("&");
        Integer studentId = Integer.parseInt(parts[0].split("=")[1]);
        long timestamp = Long.parseLong(parts[3].split("=")[1]);
        LocalDateTime signedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneOffset.UTC);

        // ЛОГ: Успішна перевірка
        publishAudit(performer, "INFO", "Успішна перевірка цілісності заявки", applicationId);

        return ApplicationVerificationResponseDto.builder()
                .isSignatureValid(true)
                .isContentIntact(true)
                .message("УСПІХ: Підпис валідний. Цілісність даних підтверджена.")
                .signedAt(signedAt)
                .studentId(studentId)
                .build();
    }

    // Допоміжний метод для надсилання події
    private void publishAudit(User user, String level, String message, Integer appId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                level,
                message,
                "Application",
                appId
        ));
    }
}