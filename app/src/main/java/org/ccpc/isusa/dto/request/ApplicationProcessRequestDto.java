package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationProcessRequestDto {
    @NotNull(message = "ID статусу обов'язковий")
    private Integer statusId; // Напр., ID для "Схвалено" або "Відхилено"

    private String comment; // Причина відмови або коментар
}