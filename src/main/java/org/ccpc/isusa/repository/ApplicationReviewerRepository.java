package org.ccpc.isusa.repository;

import org.ccpc.isusa.entity.ApplicationReviewer;
import org.ccpc.isusa.entity.ApplicationReviewerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationReviewerRepository extends JpaRepository<ApplicationReviewer, ApplicationReviewerId> {

    List<ApplicationReviewer> findByApplication_ApplicationId(Integer applicationId);

    List<ApplicationReviewer> findByReviewerUser_UserId(Integer userId);

    @Query("SELECT ar FROM ApplicationReviewer ar WHERE ar.application.applicationId = :applicationId AND ar.isApproved = :isApproved")
    List<ApplicationReviewer> findByApplicationAndApprovalStatus(@Param("applicationId") Integer applicationId,
                                                                 @Param("isApproved") Boolean isApproved);
}
