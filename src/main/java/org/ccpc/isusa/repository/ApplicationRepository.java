package org.ccpc.isusa.repository;

import org.ccpc.isusa.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Integer> {

    List<Application> findByStudent_StudentId(Integer studentId);

    List<Application> findByApplicationStatus_StatusId(Integer statusId);

    List<Application> findByApplicationType_TypeId(Integer typeId);

    @Query("SELECT a FROM Application a WHERE a.student.studentId = :studentId AND a.applicationStatus.statusId = :statusId")
    List<Application> findByStudentAndStatus(@Param("studentId") Integer studentId,
                                             @Param("statusId") Integer statusId);
}

