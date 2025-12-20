package org.ccpc.isusa.entity.main;

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

    // === НОВИЙ ЗВ'ЯЗОК ДЛЯ ПРАВ ДОСТУПУ (RBAC) ===
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "RolePermissions", // Проміжна таблиця
            joinColumns = @JoinColumn(name = "RoleID"),
            inverseJoinColumns = @JoinColumn(name = "PermissionID")
    )
    private Set<Permission> permissions;

    // --- Зв'язки з іншими таблицями (без змін) ---
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private Set<User> users;

    // === РЕАЛІЗАЦІЯ GrantedAuthority ===
    @Override
    public String getAuthority() {
        // У моделі RBAC, 'Authority' - це самостійне право, а не назва ролі.
        // Ми повертаємо лише назву ролі, щоб спростити логіку.
        // Основні права (Permissions) повертаються через User.getAuthorities().
        return this.roleName;
    }
}