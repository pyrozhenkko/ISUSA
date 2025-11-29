package org.ccpc.isusa.dto.response;

import org.ccpc.isusa.dto.response.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Відповідь, що надсилається після успішного входу або реєстрації.
 * Містить токен та дані про користувача.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {

    /**
     * JWT
     */
    private String token;

    /**
     * Інформація про користувача, який увійшов.
     */
    private UserResponseDto user;
}