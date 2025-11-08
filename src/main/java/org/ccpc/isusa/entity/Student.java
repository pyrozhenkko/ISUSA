package org.ccpc.isusa.entity;

import jakarta.persistence.*;
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
    private Integer studentId; // НЕ автоінкремент, згідно зі схемою (INT PRIMARY KEY)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserID", nullable = false, unique = true)
    private User user;

    @Column(name = "GroupID", length = 20)
    private String groupId;

    @Column(name = "Specialty", length = 100)
    private String specialty;

    @Column(name = "Faculty", length = 100)
    private String faculty;

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private Set<Application> applications;
}