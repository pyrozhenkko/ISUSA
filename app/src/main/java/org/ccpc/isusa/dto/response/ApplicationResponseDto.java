// ==================== ApplicationResponseDto.java ====================
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
public class ApplicationResponseDto {
    private Integer applicationId;
    private Integer studentId;
    private String studentName;
    private Integer typeId;
    private String typeName;
    private Integer statusId;
    private String statusName;
    private String title;
    private String content;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private Integer processedByUserId;
    private String processedByUserName;
}

// ==================== UserResponseDto.java ====================
