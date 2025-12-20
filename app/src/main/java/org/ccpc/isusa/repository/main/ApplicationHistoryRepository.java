package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.ApplicationHistory;
import org.ccpc.isusa.entity.main.User;
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

    // Знайти всі дії, виконані конкретним користувачем (працівником)
    List<ApplicationHistory> findByChangedByUser(User user);

    // Знайти історію конкретної заявки (корисно для детального перегляду)
    List<ApplicationHistory> findByApplicationApplicationId(Integer applicationId);
}
