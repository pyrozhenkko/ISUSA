package org.ccpc.isusa.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class ChartDataDto {
    private LocalDate date;
    private Long infoCount;   // Зелена лінія (Успішні дії)
    private Long warnCount;   // Жовта лінія (Підозрілі дії)
    private Long errorCount;  // Червона лінія (Помилки/Атаки)
    private Long totalLogs;   // Загальне навантаження
}