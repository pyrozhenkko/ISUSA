package org.ccpc.isusa.dto.request;

import lombok.Data;

/**
 * DTO, який приймає дані для НОВОЇ заявки,
 * а також пароль користувача для підтвердження "підпису".
 */
@Data
public class ApplicationSignRequestDto {

    // Дані самої заявки
    private Integer typeId; // ID типу заяви
    private String title;
    private String content;

    // Дані для "Підпису" (Акт волевиявлення)
    private String password; // Поточний пароль користувача для підтвердження
}