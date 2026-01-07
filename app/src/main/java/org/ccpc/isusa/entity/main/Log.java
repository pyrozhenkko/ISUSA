package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @NotNull
    private LocalDateTime logDate;

    // INFO, ERROR, WARN, SECURITY
    @Column(name = "Level", length = 20)
    private String level;

    // (може бути null, якщо це системна дія)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID")
    private User user;

    // Опис дії
    @Column(name = "Message", columnDefinition = "TEXT")
    private String message;

    // Наприклад: "Application", "User", "Student"
    @Column(name = "EntityType", length = 50)
    @Size(max = 50)
    private String entityType;

    // ID конкретного запису (наприклад, applicationId)
    @Column(name = "EntityID")
    private Integer entityId;
}