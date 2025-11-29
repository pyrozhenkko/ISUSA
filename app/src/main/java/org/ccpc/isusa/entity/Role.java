package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.Set;

@Entity
@Table(name = "Roles")
@Getter
@Setter
@NoArgsConstructor
public class Role implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoleID")
    private Integer roleId;

    @Column(name = "RoleName", length = 50, nullable = false, unique = true)
    private String roleName;

    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private Set<User> users;

    // === GrantedAuthority ===

    @Override
    public String getAuthority() {
        // Spring Security очікує, що назва ролі буде
        // у форматі "ROLE_ADMIN", "ROLE_STUDENT"
        // (Це стандарт, який можна налаштувати, але так простіше)
        return "ROLE_" + this.roleName;
    }
}