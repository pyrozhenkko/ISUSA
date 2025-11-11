package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Integer userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleID", nullable = false)
    private Role role;

    @Column(name = "Username", length = 100, nullable = false, unique = true)
    private String username;

    @Column(name = "PasswordHash", length = 256, nullable = false)
    private String passwordHash;

    @Column(name = "FullName", length = 150)
    private String fullName;

    @Column(name = "Email", length = 100, unique = true)
    private String email;

    @Column(name = "IsActive")
    private Boolean isActive = true; // Відповідає DEFAULT TRUE

    // Зв'язки з іншими таблицями
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Student student;

    @OneToMany(mappedBy = "processedByUser", fetch = FetchType.LAZY)
    private Set<Application> processedApplications;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<Comment> comments;

    @OneToMany(mappedBy = "reviewerUser", fetch = FetchType.LAZY)
    private Set<ApplicationReviewer> reviews;

    @OneToMany(mappedBy = "changedByUser", fetch = FetchType.LAZY)
    private Set<ApplicationHistory> changes;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private Set<Log> logs;
}