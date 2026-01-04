package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.antlr.v4.runtime.misc.NotNull;
import org.ccpc.isusa.entity.main.Role;

import java.time.LocalDateTime;

@Data
public class StaffCreateRequestDto {

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

    private Role role;
}
