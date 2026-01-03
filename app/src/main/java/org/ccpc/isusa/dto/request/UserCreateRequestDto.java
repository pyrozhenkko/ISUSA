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

    @NotBlank(message = "First name cannot be empty")
    private String firstName;

    @NotBlank(message = "Last name cannot be empty")
    private String lastName;

    private String middleName;

    @Email(message = "Некоректний формат email")
    @NotBlank(message = "Email не може бути порожнім")
    private String email;

    @NotBlank(message = "Назва ролі не може бути порожньою")
    private String roleName; // "ADMIN", "TEACHER", "DEANERY_STAFF"

    private String faculty;
    private String position;
    private String department;


    // Опціональні поля для викладачів/студентів (можна додати пізніше, якщо треба)
    // private String department;
    public String getFullName() {
        StringBuilder sb = new StringBuilder();

        if (lastName != null) sb.append(lastName);

        if (firstName != null) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(firstName);
        }

        if (middleName != null && !middleName.isBlank()) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(middleName);
        }

        return sb.toString();
    }
}