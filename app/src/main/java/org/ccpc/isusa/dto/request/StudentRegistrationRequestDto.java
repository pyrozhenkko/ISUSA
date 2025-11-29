package org.ccpc.isusa.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Спеціалізований DTO, який об'єднує дані для створення
 * User та пов'язаного з ним Student за один запит.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequestDto {

    private String username;
    private String password;
    private String fullName;
    private String email;

    private Integer studentId; // Student ID (білет)
    private String groupId;
    private String specialty;
    private String faculty;
}