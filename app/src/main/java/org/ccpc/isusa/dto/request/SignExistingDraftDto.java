package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO для підписання вже існуючої чернетки.
 */
@Data
public class SignExistingDraftDto {
    @NotBlank(message = "Пароль необхідний для підпису")
    private String password;
}