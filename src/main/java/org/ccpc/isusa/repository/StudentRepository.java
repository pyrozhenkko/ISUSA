package org.ccpc.isusa.repository;

import org.ccpc.isusa.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    Optional<Student> findByUser_UserId(Integer userId);

    List<Student> findByFaculty(String faculty);

    List<Student> findBySpecialty(String specialty);

    List<Student> findByGroupId(String groupId);
}
