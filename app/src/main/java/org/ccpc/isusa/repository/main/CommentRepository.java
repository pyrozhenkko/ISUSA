package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {

    List<Comment> findByApplication_ApplicationId(Integer applicationId);

    List<Comment> findByUser_UserId(Integer userId);

    @Query("SELECT c FROM Comment c WHERE c.application.applicationId = :applicationId ORDER BY c.createdDate DESC")
    List<Comment> findByApplicationOrderByDateDesc(@Param("applicationId") Integer applicationId);
}
