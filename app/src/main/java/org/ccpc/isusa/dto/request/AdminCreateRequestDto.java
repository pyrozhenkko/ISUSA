package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminCreateRequestDto {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String middleName;

    @NotBlank
    private String faculty;

    @NotBlank
    private String department;

    @NotBlank
    private String position;

    private String phoneNumber;

    private LocalDateTime dateOfBirth;
}
