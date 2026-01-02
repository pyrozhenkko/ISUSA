package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "application_status")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "statusid")
    private Integer statusId;

    @Column(name = "status_name", length = 50, nullable = false, unique = true)
    private String statusName;

    @OneToMany(mappedBy = "applicationStatus", fetch = FetchType.LAZY)
    private Set<Application> applications;

    @OneToMany(mappedBy = "status", fetch = FetchType.LAZY)
    private Set<ApplicationHistory> histories;

    // Константи для швидкого доступу до статусів
    public static final String DRAFT = "Чернетка";
    public static final String NEW = "Нова";
    public static final String IN_REVIEW = "На розгляді";
    public static final String NEEDS_CLARIFICATION = "Потребує уточнення";
    public static final String APPROVED = "Схвалено";
    public static final String REJECTED = "Відхилено";
    public static final String CANCELLED = "Скасовано";
}