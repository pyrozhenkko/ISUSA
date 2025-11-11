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
public class CommentResponseDto {
    private Integer commentId;
    private Integer applicationId;
    private Integer userId;
    private String userName;
    private String commentText;
    private LocalDateTime createdDate;
}
