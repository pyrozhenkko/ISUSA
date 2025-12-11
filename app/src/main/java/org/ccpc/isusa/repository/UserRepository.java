package org.ccpc.isusa.repository;

import org.ccpc.isusa.entity.Role;
import org.ccpc.isusa.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByRole_RoleId(Integer roleId);

    List<User> findByIsActive(Boolean isActive);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByStudentStudentId(Integer studentId);

    List<User> findByRole(Role role);

    // === SOFT-DELETE МЕТОДИ ===

    /**
     * Знаходить активних користувачів за username (не видалених)
     */
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.isDeleted = false")
    Optional<User> findByUsernameAndNotDeleted(String username);

    /**
     * Знаходить активних користувачів за email (не видалених)
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isDeleted = false")
    Optional<User> findByEmailAndNotDeleted(String email);

    /**
     * Отримує всіх активних користувачів (не видалених)
     */
    @Query("SELECT u FROM User u WHERE u.isDeleted = false")
    List<User> findAllActive();

    /**
     * Отримує всіх активних користувачів за роллю
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isDeleted = false")
    List<User> findByRoleAndNotDeleted(Role role);

    /**
     * Отримує всіх активних користувачів за статусом активності
     */
    @Query("SELECT u FROM User u WHERE u.isActive = :isActive AND u.isDeleted = false")
    List<User> findByIsActiveAndNotDeleted(Boolean isActive);

    /**
     * Отримує видалених користувачів (для адміністративних цілей)
     */
    @Query("SELECT u FROM User u WHERE u.isDeleted = true")
    List<User> findAllDeleted();
}
