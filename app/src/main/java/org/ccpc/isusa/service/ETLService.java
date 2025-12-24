package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.Log;
import org.ccpc.isusa.entity.reports.DailyReport;
import org.ccpc.isusa.entity.reports.ETLMetadata;
import org.ccpc.isusa.entity.reports.ReportLog;
import org.ccpc.isusa.repository.main.LogRepository;
import org.ccpc.isusa.repository.reports.DailyReportRepository;
import org.ccpc.isusa.repository.reports.ETLMetadataRepository;
import org.ccpc.isusa.repository.reports.ReportLogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ETLService {

    private final LogRepository mainLogRepository;
    private final ReportLogRepository reportLogRepository;
    private final DailyReportRepository dailyReportRepository;
    private final ETLMetadataRepository etlMetadataRepository;

    private static final String JOB_NAME = "MAIN_LOGS_TO_REPORTS";

    /**
     * Запуск процесу перенесення даних.
     * Налаштовано на запуск щогодини (0 хвилина кожної години).
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional("reportsTransactionManager") // Гарантуємо цілісність бази звітів
    public void runEtl() {
        log.info("ETL: Початок синхронізації логів...");

        // 1. Отримуємо метадані останнього запуску
        ETLMetadata metadata = etlMetadataRepository.findById(JOB_NAME)
                .orElse(new ETLMetadata(JOB_NAME, 0, LocalDateTime.now()));

        // 2. Витягуємо нові логи з основної бази (isusa_main)
        List<Log> newLogs = mainLogRepository.findByLogIdGreaterThanOrderByLogIdAsc(metadata.getLastProcessedLogId());

        if (newLogs.isEmpty()) {
            log.info("ETL: Нових записів не знайдено.");
            return;
        }

        // 3. Обробка та завантаження
        for (Log logEntry : newLogs) {
            // А. Створення архівної копії
            ReportLog archive = ReportLog.builder()
                    .logId(logEntry.getLogId())
                    .logDate(logEntry.getLogDate())
                    .level(logEntry.getLevel())
                    .userId(logEntry.getUser() != null ? logEntry.getUser().getUserId() : null)
                    .message(logEntry.getMessage())
                    .entityType(logEntry.getEntityType())
                    .entityId(logEntry.getEntityId())
                    .build();

            reportLogRepository.save(archive);

            // Б. Оновлення щоденної статистики
            updateDailyStatistics(logEntry);
        }

        // 4. Фіксація прогресу
        Integer lastId = newLogs.get(newLogs.size() - 1).getLogId();
        metadata.setLastProcessedLogId(lastId);
        metadata.setLastRunTime(LocalDateTime.now());
        etlMetadataRepository.save(metadata);

        log.info("ETL: Успішно оброблено {} записів. Останній ID: {}", newLogs.size(), lastId);
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
}