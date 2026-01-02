package org.ccpc.isusa.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO для зміни статусу заявки (Використовується Адміном/Деканатом).
 */
@Data
public class ApplicationStatusUpdateDto {

    @NotNull(message = "ID нового статусу є обов'язковим")
    private Integer statusId;
    private String comment;

}