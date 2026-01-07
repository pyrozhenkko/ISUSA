package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ApplicationHistory")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HistoryID")
    private Integer historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ApplicationID", nullable = false)
    @NotNull
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StatusID", nullable = false)
    @NotNull
    private ApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ChangedByUserID", nullable = false)
    @NotNull
    private User changedByUser;

    @CreationTimestamp
    @Column(name = "ChangeTimestamp", updatable = false)
    @NotNull
    private LocalDateTime changeTimestamp;
}
