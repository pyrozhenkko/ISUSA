package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.response.ApplicationVerificationResponseDto;
import org.ccpc.isusa.entity.main.Application;
import org.ccpc.isusa.repository.main.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * "Аудитор".
 * Відповідає за перевірку цілісності та автентичності підпису.
 */
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final ApplicationRepository applicationRepository;
    private final SignatureService signatureService;

    @Transactional(readOnly = true)
    public ApplicationVerificationResponseDto verifyApplicationIntegrity(Integer applicationId) {

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Заявку з ID " + applicationId + " не знайдено."));

        // 1. Перевірка, чи є що перевіряти
        if (app.getSignature() == null || app.getDataToSign() == null || app.getContentHash() == null) {
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(false)
                    .message("Помилка: Ця заявка не була підписана.")
                    .build();
        }

        // --- 2. ПЕРЕВІРКА ЦІЛІСНОСТІ КОНТЕНТУ (Крок 1 аудиту) ---
        // Ми "перераховуємо" хеш поточного контенту
        // і порівнюємо його з тим, що був збережений.
        String currentContentHash = signatureService.hashData(app.getContent());
        boolean isContentIntact = currentContentHash.equals(app.getContentHash());

        if (!isContentIntact) {
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(false)
                    .message("ПОПЕРЕДЖЕННЯ: Зміст (content) заявки було змінено ПІСЛЯ підписання!")
                    .build();
        }

        // --- 3. ПЕРЕВІРКА КРИПТОГРАФІЧНОГО ПІДПИСУ (Крок 2 аудиту) ---
        // (RSA-перевірка за допомогою Публічного Ключа)
        boolean isSignatureValid = signatureService.verify(app.getDataToSign(), app.getSignature());

        if (!isSignatureValid) {
            return ApplicationVerificationResponseDto.builder()
                    .isSignatureValid(false)
                    .isContentIntact(true) // Контент цілий, але...
                    .message("КРИТИЧНА ПОМИЛКА: Підпис (signature) не валідний! Дані підпису (dataToSign) були змінені!")
                    .build();
        }

        // --- 4. УСПІХ ---
        // Якщо обидві перевірки пройшли, витягуємо дані з підпису
        // (Це просто для інформації, ми вже довіряємо 'dataToSign')
        String[] parts = app.getDataToSign().split("&");
        Integer studentId = Integer.parseInt(parts[0].split("=")[1]);
        long timestamp = Long.parseLong(parts[3].split("=")[1]);
        LocalDateTime signedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneOffset.UTC);

        return ApplicationVerificationResponseDto.builder()
                .isSignatureValid(true)
                .isContentIntact(true)
                .message("УСПІХ: Підпис валідний. Цілісність даних підтверджена.")
                .signedAt(signedAt)
                .studentId(studentId)
                .build();
    }
}