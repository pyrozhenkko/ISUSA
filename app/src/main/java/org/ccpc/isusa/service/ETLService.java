package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.Log;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.entity.reports.DailyReport;
import org.ccpc.isusa.entity.reports.ETLMetadata;
import org.ccpc.isusa.entity.reports.ReportLog;
import org.ccpc.isusa.event.AuditEvent; // Твоя подія аудиту
import org.ccpc.isusa.repository.main.LogRepository;
import org.ccpc.isusa.repository.reports.DailyReportRepository;
import org.ccpc.isusa.repository.reports.ETLMetadataRepository;
import org.ccpc.isusa.repository.reports.ReportLogRepository;
import org.springframework.context.ApplicationEventPublisher; // Паблішер
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ETLService {

    private final LogRepository mainLogRepository;
    private final ReportLogRepository reportLogRepository;
    private final DailyReportRepository dailyReportRepository;
    private final ETLMetadataRepository etlMetadataRepository;

    // 1. Ін'єкція паблішера для бізнес-аудиту
    private final ApplicationEventPublisher eventPublisher;

    private static final String JOB_NAME = "MAIN_LOGS_TO_REPORTS";

    @Scheduled(cron = "0 0 * * * *")
    @Transactional("reportsTransactionManager")
    public void runEtl() {
        log.info("ETL: Початок синхронізації логів...");

        ETLMetadata metadata = etlMetadataRepository.findById(JOB_NAME)
                .orElse(new ETLMetadata(JOB_NAME, 0, LocalDateTime.now()));

        List<Log> newLogs = mainLogRepository.findByLogIdGreaterThanOrderByLogIdAsc(metadata.getLastProcessedLogId());

        if (newLogs.isEmpty()) {
            log.info("ETL: Нових записів не знайдено.");
            return;
        }

        // Пакетне збереження (Batch Save) для швидкості
        List<ReportLog> archives = new ArrayList<>();

        try {
            for (Log logEntry : newLogs) {
                // Пропускаємо власні логи системи ETL, щоб не було нескінченного циклу
                if ("System_ETL".equals(logEntry.getEntityType())) continue;

                ReportLog archive = ReportLog.builder()
                        .logId(logEntry.getLogId())
                        .logDate(logEntry.getLogDate())
                        .level(logEntry.getLevel())
                        .userId(logEntry.getUser() != null ? logEntry.getUser().getUserId() : null)
                        .message(logEntry.getMessage())
                        .entityType(logEntry.getEntityType())
                        .entityId(logEntry.getEntityId())
                        .build();

                archives.add(archive);
                updateDailyStatistics(logEntry);
            }

            reportLogRepository.saveAll(archives);

            // Фіксація прогресу
            Integer lastId = newLogs.get(newLogs.size() - 1).getLogId();
            metadata.setLastProcessedLogId(lastId);
            metadata.setLastRunTime(LocalDateTime.now());
            etlMetadataRepository.save(metadata);

            // 2. ЛОГ: Успішне завершення (як ми робили в інших сервісах)
            publishAudit(null, "INFO", "ETL синхронізація завершена. Оброблено: " + archives.size(), null);
            log.info("ETL: Успішно оброблено {} записів.", archives.size());

        } catch (Exception e) {
            // 3. ЛОГ: Помилка процесу
            publishAudit(null, "ERROR", "Критична помилка ETL процесу: " + e.getMessage(), null);
            log.error("ETL Error: ", e);
            throw e;
        }
    }

    private void updateDailyStatistics(Log logEntry) {
        LocalDate logDate = logEntry.getLogDate().toLocalDate();
        DailyReport report = dailyReportRepository.findByReportDate(logDate)
                .orElse(DailyReport.builder()
                        .reportDate(logDate)
                        .totalLogs(0L).infoCount(0L).warnCount(0L).errorCount(0L)
                        .build());

        report.setTotalLogs(report.getTotalLogs() + 1);
        String level = logEntry.getLevel() != null ? logEntry.getLevel().toUpperCase() : "UNKNOWN";
        switch (level) {
            case "INFO" -> report.setInfoCount(report.getInfoCount() + 1);
            case "WARN" -> report.setWarnCount(report.getWarnCount() + 1);
            case "ERROR" -> report.setErrorCount(report.getErrorCount() + 1);
        }
        dailyReportRepository.save(report);
    }

    /**
     * Допоміжний метод для надсилання подій аудиту (аналогічно іншим сервісам)
     */
    private void publishAudit(User user, String level, String message, Integer entityId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                level,
                message,
                "System_ETL", // Спеціальний тип для ідентифікації
                entityId
        ));
    }
}