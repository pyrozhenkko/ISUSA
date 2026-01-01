package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegistrationRequestDto {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    // === Нові поля замість fullName ===
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String middleName; // Може бути пустим

    private String phoneNumber;

    // === Обов'язкові поля з User.java ===
    @NotBlank(message = "Faculty is required")
    private String faculty;

    @NotBlank(message = "Department is required")
    private String department;

    // === Дані студента ===
    @NotNull(message = "Student ID is required")
    private Integer studentId; // Номер студентського

    @NotBlank(message = "Group ID is required")
    private String groupId;

    @NotBlank(message = "Specialty is required")
    private String specialty;
}