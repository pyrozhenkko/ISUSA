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
public class LogResponseDto {
    private Integer logId;
    private LocalDateTime logDate;
    private String level;
    private Integer userId;
    private String userName;
    private String message;
}
