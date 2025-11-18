package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO для Коментаря.
 * Містить 'author' (як очікує CommentMapper).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto {
    private Integer commentId;
    private Integer applicationId;
    private String commentText;
    private LocalDateTime createdDate;

    // === (ВИПРАВЛЕНО) ===
    // Використовуємо вкладений об'єкт User для автора
    private UserResponseDto author;
}