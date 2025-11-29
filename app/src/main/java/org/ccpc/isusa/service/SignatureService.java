package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.config.keys.KeyService;
import org.ccpc.isusa.entity.Application;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

/**
 * "Крипто-Мозок".
 * Реалізує:
 * 1. hashData - SHA-256 хеш змісту заявки.
 * 2. generateDataToSign - Створює унікальний рядок для підпису (з Nonce і Timestamp).
 * 3. sign - Підписує цей рядок Приватним Ключем RSA.
 * 4. verify - Перевіряє підпис Публічним Ключем RSA.
 */
@Service
@RequiredArgsConstructor
public class SignatureService {

    private final KeyService keyService;

    /**
     * Створює хеш-відбиток змісту заявки (SHA-256).
     */
    public String hashData(String content) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Не вдалося знайти алгоритм SHA-256", e);
        }
    }

    /**
     * Створює унікальний, захищений від повторів рядок,
     * який ми будемо підписувати.
     */
    public String generateDataToSign(Integer studentId, Integer applicationId, String contentHash) {
        long timestamp = Instant.now().toEpochMilli();
        String nonce = UUID.randomUUID().toString();

        // Використовуємо формат key=value для чіткості
        return String.format(
                "studentId=%d&applicationId=%d&contentHash=%s&timestamp=%d&nonce=%s",
                studentId,
                applicationId, // Може бути null для нової заявки, це нормально
                contentHash,
                timestamp,
                nonce
        );
    }

    /**
     * "Запечатує" (підписує) рядок даних за допомогою Приватного Ключа сервера.
     */
    public String sign(String dataToSign) {
        try {
            Signature rsa = Signature.getInstance("SHA256withRSA");
            // Ініціалізуємо Приватним Ключем для ПІДПИСУ
            rsa.initSign(keyService.getPrivateKey());
            rsa.update(dataToSign.getBytes(StandardCharsets.UTF_8));
            byte[] signature = rsa.sign();
            return Base64.getEncoder().encodeToString(signature);
        } catch (Exception e) {
            throw new RuntimeException("Критична помилка: не вдалося підписати дані", e);
        }
    }

    /**
     * "Перевіряє печатку" (верифікує) підпис за допомогою Публічного Ключа.
     */
    public boolean verify(String originalData, String signatureBase64) {
        try {
            Signature rsa = Signature.getInstance("SHA256withRSA");
            // Ініціалізуємо Публічним Ключем для ПЕРЕВІРКИ
            rsa.initVerify(keyService.getPublicKey());
            rsa.update(originalData.getBytes(StandardCharsets.UTF_8));
            byte[] signatureBytes = Base64.getDecoder().decode(signatureBase64);
            return rsa.verify(signatureBytes);
        } catch (Exception e) {
            // Якщо підпис пошкоджений або невірний, повертаємо false
            // Це очікувана поведінка при спробі підробки
            return false;
        }
    }
}