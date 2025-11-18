package org.ccpc.isusa.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO для відповіді на запит про перевірку підпису.
 * Повертає результат аудиту цілісності.
 */
@Data
@Builder
public class ApplicationVerificationResponseDto {

    /**
     * true, якщо криптографічний підпис (RSA) валідний.
     */
    private boolean isSignatureValid;

    /**
     * true, якщо хеш контенту (SHA-256) збігається зі збереженим.
     */
    private boolean isContentIntact;

    /**
     * Повідомлення про результат (напр., "УСПІХ" або "ПОПЕРЕДЖЕННЯ: Зміст було змінено!").
     */
    private String message;

    /**
     * Час, коли заявка була підписана (витягнутий з dataToSign).
     */
    private LocalDateTime signedAt;

    /**
     * ID студента, який підписав (витягнутий з dataToSign).
     */
    private Integer studentId;
}