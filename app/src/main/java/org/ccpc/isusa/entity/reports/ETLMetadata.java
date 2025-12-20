package org.ccpc.isusa.entity.reports;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "etl_metadata")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ETLMetadata {
    @Id
    private String jobName; // Наприклад: "MAIN_TO_REPORTS_ETL"

    private Integer lastProcessedLogId;
    private LocalDateTime lastRunTime;
}