package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * "Безпечний" DTO для представлення User.
 * НЕ містить хеш паролю.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String roleName; // "Сплющені" дані
    private Integer studentId; // Може бути null

    private Object authorities; // або Collection<String>, якщо плануєш їх передавати

}