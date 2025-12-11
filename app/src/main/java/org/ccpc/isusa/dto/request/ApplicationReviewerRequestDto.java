package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewerRequestDto {
    @NotNull
    private Integer applicationId;
    @NotNull
    private Integer reviewerUserId;
    private String recommendationText;
    @NotNull
    private Boolean isApprovedByTeacher; // Схвалює чи ні
}
