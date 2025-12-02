package org.ccpc.isusa.repository;

import org.ccpc.isusa.entity.Role;
import org.ccpc.isusa.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
