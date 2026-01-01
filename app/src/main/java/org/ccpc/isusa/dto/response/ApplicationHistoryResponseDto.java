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
public class ApplicationHistoryResponseDto {
    private Integer historyId;
    private Integer applicationId;
    private String applicationTitle;
    private Integer statusId;
    private String statusName;
    private Integer changedByUserId;
    private String changedByUserName;
    private String changedByUserFirstName;
    private String changedByUserMiddleName;
    private String changedByUserLastName;
    private String changedByRole;
    private LocalDateTime changeTimestamp;

}
