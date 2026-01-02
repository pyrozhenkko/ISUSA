package org.ccpc.isusa.controller;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.response.AttachmentResponseDto;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.service.AttachmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    /**
     * Завантажити файл до існуючої заявки.
     * Content-Type: multipart/form-data
     */
    @PostMapping(value = "/upload/{applicationId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('application:create')") // Доступно студентам (право на створення)
    public ResponseEntity<AttachmentResponseDto> uploadFile(
            @PathVariable Integer applicationId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            return ResponseEntity.ok(attachmentService.addAttachment(applicationId, file, currentUser));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Помилка збереження файлу");
        } catch (RuntimeException e) {
            // Обробка помилок бізнес-логіки (не знайдено, не той статус, немає доступу)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Скачати файл за його ID.
     * URL: GET /api/attachments/download/{id}
     */
    @GetMapping("/download/{id}")
    @PreAuthorize("isAuthenticated()") // Будь-хто залогінений може спробувати (сервіс перевірить права доступу до заявки)
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer id, @AuthenticationPrincipal User currentUser) {
        try {
            Resource resource = attachmentService.loadFileAsResource(id, currentUser);

            // Намагаємося визначити тип контенту, або ставимо дефолтний
            String contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Файл не знайдено або доступ заборонено", e);
        }
    }

    /**
     * Завантажити фото профілю для поточного користувача.
     */
    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttachmentResponseDto> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            return ResponseEntity.ok(attachmentService.uploadUserProfileImage(file, currentUser));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Помилка збереження файлу");
        }
    }

    @GetMapping("/profile-image/{userId}")
    @PreAuthorize("permitAll()") // Можна дозволити всім бачити фото, або залишити isAuthenticated()
    public ResponseEntity<Resource> viewProfileImage(@PathVariable Integer userId) {
        try {
            Resource resource = attachmentService.getUserProfileImage(userId);

            // Визначаємо MIME-тип (image/jpeg, image/png тощо)
            String contentType = "image/jpeg"; // Можна зробити динамічно через Files.probeContentType

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    // Тут ми НЕ додаємо Content-Disposition: attachment, щоб картинка відкрилася в браузері
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
