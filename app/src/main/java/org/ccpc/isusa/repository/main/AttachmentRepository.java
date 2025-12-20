package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {

    List<Attachment> findByApplication_ApplicationId(Integer applicationId);

    Optional<Attachment> findByFileName(String fileName);
}
