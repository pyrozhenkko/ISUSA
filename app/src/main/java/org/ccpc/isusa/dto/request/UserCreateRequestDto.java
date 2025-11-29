package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO для Адміна, щоб створити нового співробітника.
 * Зверни увагу, тут НЕМАЄ полів Student, але є назва ролі.
 * Ми додаємо валідацію (@NotBlank, @Email)
 */
@Data
public class UserCreateRequestDto {

    @NotBlank(message = "Ім'я користувача (username) не може бути порожнім")
    private String username;

    @NotBlank(message = "Пароль не може бути порожнім")
    @Size(min = 8, message = "Пароль має містити щонайменше 8 символів")
    private String password;

    @NotBlank(message = "Повне ім'я не може бути порожнім")
    private String fullName;

    @Email(message = "Некоректний формат email")
    @NotBlank(message = "Email не може бути порожнім")
    private String email;

    @NotBlank(message = "Назва ролі (roleName) не може бути порожньою")
    private String roleName; // Напр., "ADMIN", "DEANERY_STAFF", "TEACHER"
}