package org.ccpc.isusa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для представлення Студента.
 * Містить вкладений об'єкт UserResponseDto.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDto {
    private Integer studentId;
    private String groupId;
    private String specialty;
    private String faculty;

    // Використовуємо вкладений об'єкт User
    private UserResponseDto userResponseDto;
}