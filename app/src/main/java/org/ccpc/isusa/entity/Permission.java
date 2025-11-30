package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Сутність для прав доступу (Permissions).
 * Наприклад: 'application:read', 'user:manage'.
 * Зв'язується з Role через ManyToMany.
 */
@Entity
@Table(name = "Permissions")
@Getter
@Setter
@NoArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PermissionID")
    private Integer permissionId;

    /**
     * Назва права доступу (Наприклад, 'application:read').
     */
    @Column(name = "PermissionName", length = 50, nullable = false, unique = true)
    private String permissionName;
}