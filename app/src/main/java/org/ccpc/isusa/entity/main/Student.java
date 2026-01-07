package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "Students")
@Getter
@Setter
@NoArgsConstructor
public class Student {

    @Id
    @Column(name = "StudentID")
    private Integer studentId; // Студак

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", nullable = false, unique = true)
    @NotNull
    private User user;

    @Column(name = "GroupID", length = 20)
    @Size(max = 20)
    private String groupId;

    @Column(name = "Specialty", length = 100)
    @Size(max = 100)
    private String specialty;

    @Column(name = "YearOfStudy")
    @Min(1)
    @Max(6)
    private Integer yearOfStudy;

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private Set<Application> applications;
}
