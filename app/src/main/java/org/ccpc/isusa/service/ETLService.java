package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.Log;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.entity.reports.DailyReport;
import org.ccpc.isusa.entity.reports.ETLMetadata;
import org.ccpc.isusa.entity.reports.ReportLog;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.repository.main.LogRepository;
import org.ccpc.isusa.repository.reports.DailyReportRepository;
import org.ccpc.isusa.repository.reports.ETLMetadataRepository;
import org.ccpc.isusa.repository.reports.ReportLogRepository;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;

    private static final String JOB_NAME = "MAIN_LOGS_TO_REPORTS";

    // Запуск щогодини
    @Scheduled(cron = "0 0 * * * *")
    // Важливо: Transactional має бути налаштований так, щоб бачити обидві бази,
    // якщо вони різні. Якщо база одна - все ок.
    @Transactional("reportsTransactionManager")
    public void runEtl() {
        log.info("ETL: Початок синхронізації логів...");

        ETLMetadata metadata = etlMetadataRepository.findById(JOB_NAME)
                .orElse(new ETLMetadata(JOB_NAME, 0, LocalDateTime.now()));

        // Читаємо тільки нові логи, яких ще не було в попередньому запуску
        List<Log> newLogs = mainLogRepository.findByLogIdGreaterThanOrderByLogIdAsc(metadata.getLastProcessedLogId());

        if (newLogs.isEmpty()) {
            return;
        }

        List<ReportLog> archives = new ArrayList<>();

        try {
            for (Log logEntry : newLogs) {
                // --- ЗАХИСТ ВІД РЕКУРСІЇ ---
                // Ми не переносимо в аналітику технічні логи самого ETL процесу.
                // Це тримає звіти чистими (тільки дії людей або важливі системні події).
                if ("System_ETL".equals(logEntry.getEntityType())) {
                    continue;
                }

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

            if (!archives.isEmpty()) {
                reportLogRepository.saveAll(archives);
            }

            // Оновлюємо курсор (останній оброблений ID)
            Integer lastId = newLogs.get(newLogs.size() - 1).getLogId();
            metadata.setLastProcessedLogId(lastId);
            metadata.setLastRunTime(LocalDateTime.now());
            etlMetadataRepository.save(metadata);

            // 1. ЛОГ: Успішне виконання
            // Цей запис потрапить в основну таблицю Logs, але наступний запуск ETL
            // проігнорує його завдяки перевірці "System_ETL".
            publishAudit(null, "INFO", "ETL синхронізація успішна. Перенесено записів: " + archives.size(), null);

            log.info("ETL: Успішно оброблено {} записів.", archives.size());

        } catch (Exception e) {
            // 2. ЛОГ: Помилка
            publishAudit(null, "ERROR", "Критична помилка ETL процесу: " + e.getMessage(), null);
            log.error("ETL Error: ", e);
            throw e; // Ре-троу для відкату транзакції, якщо це потрібно
        }
    }

    private void updateDailyStatistics(Log logEntry) {
        LocalDate logDate = logEntry.getLogDate().toLocalDate();

        // Знаходимо або створюємо звіт за день логу (а не за поточний день!)
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
            case "ERROR", "SECURITY" -> report.setErrorCount(report.getErrorCount() + 1);
        }
        dailyReportRepository.save(report);
    }

    private void publishAudit(User user, String level, String message, Integer entityId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                level,
                message,
                "System_ETL",
                entityId
        ));
    }
}