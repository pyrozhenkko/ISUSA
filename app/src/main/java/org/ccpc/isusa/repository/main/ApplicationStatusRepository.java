package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationStatusRepository extends JpaRepository<ApplicationStatus, Integer> {

    Optional<ApplicationStatus> findByStatusName(String statusName);

    boolean existsByStatusName(String statusName);
}
