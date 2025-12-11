package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequestDto {

    @NotBlank(message = "Ім'я користувача не може бути порожнім")
    private String username;

    @NotBlank(message = "Пароль не може бути порожнім")
    @Size(min = 8, message = "Пароль має містити щонайменше 8 символів")
    private String password;

    @NotBlank(message = "Повне ім'я не може бути порожнім")
    private String fullName;

    @Email(message = "Некоректний формат email")
    @NotBlank(message = "Email не може бути порожнім")
    private String email;

    @NotBlank(message = "Назва ролі не може бути порожньою")
    private String roleName; // "ADMIN", "TEACHER", "DEANERY_STAFF"

    // Опціональні поля для викладачів/студентів (можна додати пізніше, якщо треба)
    // private String department;
}