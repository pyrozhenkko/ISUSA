package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.dto.response.AttachmentResponseDto;
import org.ccpc.isusa.entity.main.Application;
import org.ccpc.isusa.entity.main.Attachment;
import org.ccpc.isusa.entity.main.Student;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.mapper.AttachmentMapper;
import org.ccpc.isusa.repository.main.ApplicationRepository;
import org.ccpc.isusa.repository.main.AttachmentRepository;
import org.ccpc.isusa.repository.main.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final AttachmentMapper attachmentMapper;

    private final ApplicationEventPublisher eventPublisher;

    @Value("${isusa.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public AttachmentResponseDto addAttachment(Integer applicationId,
                                               MultipartFile file,
                                               User currentUser) throws IOException {

        // 0. Базові перевірки
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл не передано");
        }

        long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalStateException("Файл перевищує допустимий розмір (10 MB)");
        }

        // ✅ Безпечні розширення
        Set<String> allowedExtensions = Set.of(
                "pdf","doc","docx","odt","rtf","txt",
                "xls","xlsx","ods","ppt","pptx",
                "jpg","jpeg","png","zip"
        );

        // ✅ Безпечні MIME-типи
        Set<String> allowedMimeTypes = Set.of(
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "image/jpeg",
                "image/png",
                "application/zip",
                "text/plain"
        );

        String originalFileName = file.getOriginalFilename();
        String contentType = file.getContentType();

        if (originalFileName == null || !originalFileName.contains(".")) {
            throw new IllegalArgumentException("Некоректна назва файлу");
        }

        String extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1).toLowerCase();

        if (!allowedExtensions.contains(extension) || !allowedMimeTypes.contains(contentType)) {
            publishAudit(currentUser, "WARN",
                    "Спроба завантаження забороненого файлу: " + originalFileName,
                    "Attachment", null);
            throw new IllegalArgumentException("Недозволений тип файлу");
        }

        // 1. Перевірка, чи користувач є студентом
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Ви не є студентом!"));

        // 2. Перевірка доступу до заявки
        Application app = applicationRepository
                .findByApplicationIdAndStudent(applicationId, student)
                .orElseThrow(() -> {
                    publishAudit(currentUser, "WARN",
                            "Спроба доступу до чужої заявки ID: " + applicationId,
                            "Application", applicationId);
                    return new EntityNotFoundException("Заявку не знайдено або доступ заборонено");
                });

        // 3. Перевірка статусу заявки
        String status = app.getApplicationStatus().getStatusName();
        if (!"Чернетка".equals(status) && !"Нова".equals(status)) {
            publishAudit(currentUser, "WARN",
                    "Відмовлено у завантаженні файлу. Статус: " + status,
                    "Application", applicationId);
            throw new IllegalStateException("Не можна додавати файли до заявки в статусі: " + status);
        }

        // 4. Збереження файлу на диск
        String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 5. Збереження в БД
        Attachment attachment = new Attachment();
        attachment.setApplication(app);
        attachment.setFileName(originalFileName);
        attachment.setFilePath(filePath.toString());
        attachment.setUploadedDate(LocalDateTime.now());

        Attachment savedAttachment = attachmentRepository.save(attachment);

        // 6. Audit log
        publishAudit(currentUser, "INFO",
                "Завантажено файл: " + originalFileName,
                "Attachment", savedAttachment.getAttachmentId());

        return attachmentMapper.toResponseDto(savedAttachment);
    }

    /**
     * Завантаження файлу як ресурсу для скачування.
     */
    public Resource loadFileAsResource(Integer attachmentId, User currentUser) throws MalformedURLException {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new EntityNotFoundException("Вкладення не знайдено"));

        // Тут можна додати додаткову перевірку прав доступу, якщо потрібно

        // 3. ЛОГ: Фіксуємо факт скачування (хто і що скачав)
        publishAudit(currentUser, "INFO", "Скачано файл: " + attachment.getFileName(), "Attachment", attachmentId);

        Path filePath = Paths.get(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            publishAudit(currentUser, "ERROR", "Помилка читання файлу з диску: " + attachment.getFileName(), "Attachment", attachmentId);
            throw new RuntimeException("Не вдалося прочитати файл: " + attachment.getFileName());
        }

    }

    /**
     * Допоміжний метод для надсилання подій аудиту
     */
    private void publishAudit(User user, String level, String message, String entityType, Integer entityId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                level,
                message,
                entityType,
                entityId
        ));
    }
}