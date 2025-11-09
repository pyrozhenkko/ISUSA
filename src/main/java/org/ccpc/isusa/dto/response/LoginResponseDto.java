package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {

    /**
     * JWT (або інший) токен доступу.
     */
    private String token;

    /**
     * Інформація про користувача, який увійшов.
     */
    private UserResponseDto user;
}