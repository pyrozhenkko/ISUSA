package org.ccpc.isusa.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewerRequestDto {
    private Integer applicationId;
    private Integer reviewerUserId;
    private String recommendationText;
    private Boolean isApproved;
}
