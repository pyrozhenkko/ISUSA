package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO для створення або редагування чернетки.
 * Тут немає пароля, бо це ще не юридично значуща дія.
 */
@Data
public class ApplicationDraftRequestDto {
    @NotNull(message = "Тип заяви обов'язковий")
    private Integer typeId;

    @NotBlank(message = "Заголовок не може бути порожнім")
    private String title;

    @NotBlank(message = "Зміст не може бути порожнім")
    private String content;
}