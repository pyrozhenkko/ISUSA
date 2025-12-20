package org.ccpc.isusa.entity.reports;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReportLog {
    @Id
    private Integer logId; // Ключ з основної БД

    private LocalDateTime logDate;
    private String level;
    private Integer userId; // Просто ID користувача (Long або Integer)

    @Column(columnDefinition = "TEXT")
    private String message;

    private String entityType;
    private Integer entityId;
}