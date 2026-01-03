package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserUpdateRequestDto {
    private String firstName;
    private String middleName;
    private String lastName;


    @Email
    private String email;

    private String username;

    private String roleName;
    private String department;
    private String faculty;
    private String position;
}