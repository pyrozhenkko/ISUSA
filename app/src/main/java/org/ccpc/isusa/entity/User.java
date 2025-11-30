package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")  // ✅ нижній регістр
@Getter
@Setter
@NoArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid")  // ✅ нижній регістр
    private Integer userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "roleid", nullable = false)  // ✅ нижній регістр
    private Role role;

    @Column(name = "username", length = 100, nullable = false, unique = true)  // ✅ нижній регістр
    private String username;

    @Column(name = "password_hash", length = 256, nullable = false)  // ✅ нижній регістр
    private String passwordHash;

    @Column(name = "full_name", length = 150)  // ✅ нижній регістр
    private String fullName;

    @Column(name = "email", length = 100, unique = true)  // ✅ нижній регістр
    private String email;

    @Column(name = "is_active")  // ✅ нижній регістр
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
        return this.role.getPermissions().stream()
                .map(p -> new SimpleGrantedAuthority(p.getPermissionName()))
                .collect(Collectors.toSet());
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