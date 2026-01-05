package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserUpdateRequestDto {
    private String firstName;
    private String lastName;
    private String middleName;
    private String username;

    @Email
    private String email;
    private String phoneNumber;
    private String faculty;
    private String department;
    private String position;
    private LocalDate dateOfBirth;
    private LocalDateTime enrolledDate;
    private Boolean isActive;
}