package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Це "повний" DTO для однієї Заявки.
 * Він містить всю інформацію, 
 * включаючи вкладені об'єкти (студент, коментарі, підпис).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDto {

    // --- (Основні поля самої заявки) ---
    private Integer applicationId;
    private String title;
    private String content;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    // --- (Вкладені об'єкти - саме їх не вистачало) ---

    /**
     * Інформація про студента, який подав заявку.
     * (Використовує StudentResponseDto)
     */
    private StudentResponseDto student;

    /**
     * Тип цієї заявки (напр., "На стипендію").
     * (Використовує ApplicationTypeResponseDto)
     */
    private ApplicationTypeResponseDto applicationType;

    /**
     * Поточний статус заявки (напр., "В обробці").
     * (Використовує ApplicationStatusResponseDto)
     */
    private ApplicationStatusResponseDto applicationStatus;

    /**
     * Хто обробив цю заявку (напр., адмін).
     * (Використовує UserResponseDto)
     */
    private UserResponseDto processedByUser;

    /**
     * Список коментарів до цієї заявки.
     * (Використовує CommentResponseDto)
     */
    private Set<CommentResponseDto> comments;

    /**
     * Список вкладених файлів.
     * (Використовує AttachmentResponseDto)
     */
    private Set<AttachmentResponseDto> attachments;

    // --- (Поля цифрового підпису) ---

    /**
     * Дані, які були підписані (StudentId + Hash + Timestamp + Nonce).
     */
    private String dataToSign;

    /**
     * Сам асиметричний підпис (RSA).
     */
    private String signature;
}