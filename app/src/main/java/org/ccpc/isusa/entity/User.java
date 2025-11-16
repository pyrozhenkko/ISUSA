    package org.ccpc.isusa.entity;

    import jakarta.persistence.*;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;

    import java.util.Collection;
    import java.util.List;
    import java.util.Set;

    @Entity
    @Table(name = "Users")
    @Getter
    @Setter
    @NoArgsConstructor
    public class User implements UserDetails {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "UserID")
        private Integer userId;

        // === ЗМІНЮЄМО НА EAGER ===
        // Це потрібно, щоб Spring Security міг ОДРАЗУ отримати роль
        // користувача, коли він завантажується.
        @ManyToOne(fetch = FetchType.EAGER)
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
        private Boolean isActive = true;

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

            return List.of(role);
        }

        @Override
        public String getPassword() {
            return this.passwordHash;
        }

        @Override
        public String getUsername() {
            return this.username;
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
           return this.isActive;
        }
    }