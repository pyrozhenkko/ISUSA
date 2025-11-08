package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "Logs")
@Getter
@Setter
@NoArgsConstructor
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LogID")
    private Integer logId;

    @CreationTimestamp
    @Column(name = "LogDate", updatable = false)
    private LocalDateTime logDate;

    @Column(name = "Level", length = 20)
    private String level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID") // Nullable
    private User user;

    @Lob
    @Column(name = "Message")
    private String message;
}