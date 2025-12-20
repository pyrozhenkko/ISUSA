package org.ccpc.isusa.repository.reports;

import org.ccpc.isusa.entity.reports.ReportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportLogRepository extends JpaRepository<ReportLog, Integer> {
    // Тут можна буде додати методи пошуку за рівнем або типом сутності для звітів
}