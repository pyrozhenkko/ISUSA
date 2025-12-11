package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserUpdateRequestDto {
    private String fullName;

    @Email
    private String email;

    private String username;

    private String roleName;
}