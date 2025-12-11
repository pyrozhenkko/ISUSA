package org.ccpc.isusa.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UserActivityReportDto {
    private UserResponseDto user; // Інфо про користувача, якого перевіряємо
    private int totalApplications; // Загальна кількість заявок (або дій)
    private List<ApplicationResponseDto> applications; // Список заявок (для студента)
    private List<ApplicationHistoryResponseDto> history; // Список дій (для працівника)
}