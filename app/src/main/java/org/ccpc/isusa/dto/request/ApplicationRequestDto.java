// ==================== ApplicationRequestDto.java ====================
package org.ccpc.isusa.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequestDto {
    private Integer studentId;
    private Integer typeId;
    private Integer statusId;
    private String title;
    private String content;
}

