package org.ccpc.isusa.repository;

import org.ccpc.isusa.entity.ApplicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationHistoryRepository extends JpaRepository<ApplicationHistory, Integer> {

    List<ApplicationHistory> findByApplication_ApplicationId(Integer applicationId);

    List<ApplicationHistory> findByChangedByUser_UserId(Integer userId);

    @Query("SELECT ah FROM ApplicationHistory ah WHERE ah.application.applicationId = :applicationId ORDER BY ah.changeTimestamp DESC")
    List<ApplicationHistory> findByApplicationOrderByDateDesc(@Param("applicationId") Integer applicationId);
}
