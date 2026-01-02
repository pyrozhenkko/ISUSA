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
import org.ccpc.isusa.repository.main.UserRepository;
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
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final AttachmentMapper attachmentMapper;
    private final UserRepository userRepository;

    private final ApplicationEventPublisher eventPublisher;


    // Папка для збереження файлів (можна налаштувати в application.properties)
    @Value("${isusa.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public AttachmentResponseDto addAttachment(Integer applicationId, MultipartFile file, User currentUser) throws IOException {
        // 1. Перевірка, чи користувач є студентом
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Ви не є студентом!"));

        // 2. Перевірка доступу до заявки
        Application app = applicationRepository.findByApplicationIdAndStudent(applicationId, student)
                .orElseThrow(() -> {
                    // ЛОГ: Спроба доступу до чужої заявки
                    publishAudit(currentUser, "WARN", "Спроба додати файл до недоступної заявки ID: " + applicationId, "Application", applicationId);
                    return new EntityNotFoundException("Заявку не знайдено або доступ заборонено");
                });

        // 3. Перевірка статусу (можна додавати тільки до чернеток або нових)
        String status = app.getApplicationStatus().getStatusName();
        if (!"Чернетка".equals(status) && !"Нова".equals(status)) {
            // ЛОГ: Помилка статусу
            publishAudit(currentUser, "WARN", "Відмовлено у завантаженні файлу. Статус заявки: " + status, "Application", applicationId);
            throw new IllegalStateException("Не можна додавати файли до заявки в статусі: " + status);
        }

        // 4. Збереження файлу на диск
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        // 5. Збереження в БД
        Attachment attachment = new Attachment();
        attachment.setApplication(app);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(filePath.toString());
        attachment.setUploadedDate(LocalDateTime.now());

        Attachment savedAttachment = attachmentRepository.save(attachment);

        //ЛОГ: Успішне завантаження
        publishAudit(currentUser, "INFO", "Завантажено файл: " + file.getOriginalFilename(), "Attachment", savedAttachment.getAttachmentId());
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

    @Transactional
    public AttachmentResponseDto uploadUserProfileImage(MultipartFile file, User currentUser) throws IOException {
        // 1. Зберігаємо файл на диск
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir, "profiles"); // Можна створити окрему підпапку

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        // 2. Створюємо запис Attachment
        Attachment attachment = new Attachment();
        attachment.setApplication(null); // Для профілю заявка не потрібна
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(filePath.toString());
        attachment.setUploadedDate(LocalDateTime.now());
        Attachment savedAttachment = attachmentRepository.save(attachment);

        // 3. Оновлюємо посилання у користувача
        currentUser.setProfileImageId(savedAttachment);
        userRepository.save(currentUser);

        // Логування
        publishAudit(currentUser, "INFO", "Оновлено фото профілю: " + file.getOriginalFilename(), "User", currentUser.getUserId());

        return attachmentMapper.toResponseDto(savedAttachment);
    }

    public Resource getUserProfileImage(Integer userId) throws MalformedURLException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено"));

        Attachment attachment = user.getProfileImageId(); // Отримуємо зв'язаний Attachment

        if (attachment == null) {
            throw new EntityNotFoundException("У користувача немає фото профілю");
        }

        Path filePath = Paths.get(attachment.getFilePath()); // Беремо шлях з БД
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Файл не знайдено на диску");
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