package org.ccpc.isusa.repository.reports;

import org.ccpc.isusa.entity.reports.DailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyReportRepository extends JpaRepository<DailyReport, Long> {
    // Пошук існуючого запису за дату, щоб оновити статистику, а не створювати нову
    Optional<DailyReport> findByReportDate(LocalDate reportDate);
}