package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO для Вкладення.
 * Містить 'fileUrl' (як очікує AttachmentMapper).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponseDto {
    private Integer attachmentId;
    private Integer applicationId;
    private String fileName;
    private LocalDateTime uploadedDate;

    // === (ВИПРАВЛЕНО) ===
    // Це поле ми будемо наповнювати вручну в сервісі
    private String fileUrl;
}