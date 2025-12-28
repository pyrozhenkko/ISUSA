package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponseDto {
    private Integer attachmentId;
    private Integer applicationId;
    private String fileName;
    private LocalDateTime uploadedDate;
    private String fileUrl; // URL для завантаження файлу
}