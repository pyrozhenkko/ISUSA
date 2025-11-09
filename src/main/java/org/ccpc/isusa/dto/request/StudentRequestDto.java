package org.ccpc.isusa.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRequestDto {
    private Integer studentId;
    private Integer userId;
    private String groupId;
    private String specialty;
    private String faculty;
}
