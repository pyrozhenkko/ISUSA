package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.response.AttachmentResponseDto;
import org.ccpc.isusa.entity.main.Application;
import org.ccpc.isusa.entity.main.Attachment;
import org.ccpc.isusa.entity.main.Student;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.mapper.AttachmentMapper;
import org.ccpc.isusa.repository.main.ApplicationRepository;
import org.ccpc.isusa.repository.main.AttachmentRepository;
import org.ccpc.isusa.repository.main.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
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

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final AttachmentMapper attachmentMapper;

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
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено або доступ заборонено"));

        // 3. Перевірка статусу (можна додавати тільки до чернеток або нових)
        String status = app.getApplicationStatus().getStatusName();
        if (!"Чернетка".equals(status) && !"Нова".equals(status)) {
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

        return attachmentMapper.toResponseDto(savedAttachment);
    }

    /**
     * Завантаження файлу як ресурсу для скачування.
     */
    public Resource loadFileAsResource(Integer attachmentId, User currentUser) throws MalformedURLException {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new EntityNotFoundException("Вкладення не знайдено"));

        // Тут можна додати додаткову перевірку прав доступу, якщо потрібно

        Path filePath = Paths.get(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Не вдалося прочитати файл: " + attachment.getFileName());
        }
    }
}