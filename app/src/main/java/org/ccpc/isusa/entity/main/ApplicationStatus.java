package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "ApplicationStatus")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "StatusID")
    private Integer statusId;

    @Column(name = "StatusName", length = 100, nullable = false, unique = true)
    private String statusName;

    @OneToMany(mappedBy = "applicationStatus", fetch = FetchType.LAZY)
    private Set<Application> applications;

    @OneToMany(mappedBy = "status", fetch = FetchType.LAZY)
    private Set<ApplicationHistory> histories;
}