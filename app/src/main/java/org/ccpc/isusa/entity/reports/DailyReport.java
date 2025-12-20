package org.ccpc.isusa.entity.reports;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private LocalDate reportDate;

    private Long totalLogs;
    private Long infoCount;
    private Long warnCount;
    private Long errorCount;
}