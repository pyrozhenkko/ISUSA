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

    /**
     * Дата та час логування.
     * Використовуємо @Builder.Default, щоб при створенні через Builder
     * поле не було null до моменту перевірки валідатором.
     */
    @CreationTimestamp
    @Column(name = "LogDate", updatable = false, nullable = false)
    @NotNull(message = "Дата логування не може бути порожньою")
    @Builder.Default
    private LocalDateTime logDate = LocalDateTime.now();

    // INFO, ERROR, WARN, SECURITY
    @Column(name = "Level", length = 20)
    @Size(max = 20)
    private String level;

    // Користувач, який вчинив дію (може бути null для системних подій)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID")
    private User user;

    // Детальний опис події
    @Column(name = "Message", columnDefinition = "TEXT")
    private String message;

    // Тип сутності, з якою проводилась дія (напр. "Application")
    @Column(name = "EntityType", length = 50)
    @Size(max = 50)
    private String entityType;

    // ID конкретного запису (наприклад, ID заявки)
    @Column(name = "EntityID")
    private Integer entityId;
}