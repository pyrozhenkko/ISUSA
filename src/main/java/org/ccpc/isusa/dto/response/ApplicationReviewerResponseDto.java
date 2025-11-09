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
public class ApplicationReviewerResponseDto {
    private Integer applicationId;
    private Integer reviewerUserId;
    private String reviewerUserName;
    private String recommendationText;
    private Boolean isApproved;
    private LocalDateTime reviewedDate;
}
