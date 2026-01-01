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
public class UserResponseDto {
    private Integer userId;
    private String username;
    private String email;
    private String roleName;

    private String firstName;
    private String middleName;
    private String lastName;
    private String department;
    private String faculty;
    private String position;
    private String phoneNumber;
    private LocalDateTime dateOfBirth;
    private LocalDateTime enrolledDate;
    private String profileImageFileName;

    private Integer studentId;
    private Boolean isActive;
}