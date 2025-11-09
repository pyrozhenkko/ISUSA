package org.ccpc.isusa.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationHistoryRequestDto {
    private Integer applicationId;
    private Integer statusId;
    private Integer changedByUserId;
}
