package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "Logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LogID")
    private Integer logId;

    @CreationTimestamp
    @Column(name = "LogDate", updatable = false)
    private LocalDateTime logDate;

    // INFO, ERROR, WARN, SECURITY
    @Column(name = "Level", length = 20)
    private String level;

    // Хто виконав дію (може бути null, якщо це системна дія)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID")
    private User user;

    // Опис дії
    @Column(name = "Message", columnDefinition = "TEXT")
    private String message;

    // === НОВІ ПОЛЯ ДЛЯ ПРИВ'ЯЗКИ ДО БУДЬ-ЯКОЇ СУТНОСТІ ===

    // Наприклад: "Application", "User", "Student"
    @Column(name = "EntityType", length = 50)
    private String entityType;

    // ID конкретного запису (наприклад, applicationId)
    @Column(name = "EntityID")
    private Integer entityId;
}