package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@SQLDelete(sql = "UPDATE users SET is_deleted = true, deleted_date = NOW() WHERE userid = ?")
@SQLRestriction("is_deleted = false")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid")
    private Integer userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "roleid", nullable = false)
    private Role role;

    @Column(name = "username", length = 100, nullable = false, unique = true)
    private String username;
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;

    @Column(name = "password_changed_date")
    private LocalDateTime passwordChangedDate;

    @Column(name = "password_hash", length = 256, nullable = false)
    private String passwordHash;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "email", length = 100, unique = true)
    private String email;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // === SOFT-DELETE ===
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "deleted_date")
    private LocalDateTime deletedDate;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    // === ЗВ'ЯЗКИ ===

    // === РУЧНІ ГЕТТЕРИ/СЕТТЕРИ ДЛЯ STUDENT (FIX) ===
    // Додаємо їх, щоб MapStruct точно їх побачив
    // (MapStruct не бачив це поле, тому додамо геттер вручну нижче)
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

    // === UserDetails ===

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.role.getPermissions().stream()
                .map(p -> new SimpleGrantedAuthority(p.getPermissionName()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() { return this.passwordHash; }

    @Override
    public String getUsername() { return this.username; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return this.isActive; }

}