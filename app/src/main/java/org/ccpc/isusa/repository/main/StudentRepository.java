package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.Student;
import org.ccpc.isusa.entity.main.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    Optional<Student> findByUser_UserId(Integer userId);
    List<Student> findBySpecialty(String specialty);
    List<Student> findByGroupId(String groupId);
    Optional<Student> findByUser(User user);

}
