package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDto {
    private Integer studentId;
    private Integer userId;
    private String userName;
    private String fullName;
    private String groupId;
    private String specialty;
    private String faculty;
}
