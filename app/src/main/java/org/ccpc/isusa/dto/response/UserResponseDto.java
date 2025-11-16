package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Integer userId;
    private Integer roleId;
    private String roleName;
    private String username;
    private String fullName;
    private String email;
    private Boolean isActive;

    private Integer studentId;
}
