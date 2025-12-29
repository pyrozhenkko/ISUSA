package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.ApplicationDraftRequestDto;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.request.ApplicationStatusUpdateDto;
import org.ccpc.isusa.dto.request.SignExistingDraftDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.ApplicationVerificationResponseDto;
import org.ccpc.isusa.entity.main.User; // Використовуємо User entity
import org.ccpc.isusa.service.ApplicationService;
import org.ccpc.isusa.service.VerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final VerificationService verificationService;

    /**
     * Створити, підписати заявку ТА завантажити фото одним запитом.
     */
    @PostMapping(value = "/sign-submit-with-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('application:create')")
    public ResponseEntity<ApplicationResponseDto> signSubmitWithPhoto(
            @RequestParam("typeId") Integer typeId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("password") String password,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            // Збираємо DTO вручну
            ApplicationSignRequestDto request = new ApplicationSignRequestDto();
            request.setTypeId(typeId);
            request.setTitle(title);
            request.setContent(content);
            request.setPassword(password);

            return ResponseEntity.ok(
                    applicationService.signAndSubmitWithPhoto(request, file, currentUser)
            );
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Невірний пароль");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Помилка файлу");
        }
    }

    // === БЛОК СТУДЕНТА (CRUD + ПІДПИС) ===

    /**
     * Створити нову ЧЕРНЕТКУ (без підпису).
     */
    @PostMapping("/draft")
    @PreAuthorize("hasAuthority('application:create')")
    public ResponseEntity<ApplicationResponseDto> createDraft(
            @Valid @RequestBody ApplicationDraftRequestDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(applicationService.createDraft(request, currentUser));
    }

    /**
     * Редагувати ЧЕРНЕТКУ.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('application:create')")
    public ResponseEntity<ApplicationResponseDto> updateDraft(
            @PathVariable Integer id,
            @Valid @RequestBody ApplicationDraftRequestDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            return ResponseEntity.ok(applicationService.updateDraft(id, request, currentUser));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Видалити ЧЕРНЕТКУ.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('application:create')")
    public ResponseEntity<Void> deleteDraft(
            @PathVariable Integer id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            applicationService.deleteDraft(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Підписати та відправити вже існуючу чернетку.
     */
    @PostMapping("/{id}/sign")
    @PreAuthorize("hasAuthority('application:create')")
    public ResponseEntity<ApplicationResponseDto> signDraft(
            @PathVariable Integer id,
            @Valid @RequestBody SignExistingDraftDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            return ResponseEntity.ok(applicationService.signExistingDraft(id, request.getPassword(), currentUser));
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    /**
     * Створити і підписати нову заявку за один крок (Fast Track).
     */
    @PostMapping("/sign-and-submit")
    @PreAuthorize("hasAuthority('application:create')")
    public ResponseEntity<ApplicationResponseDto> signAndSubmit(
            @Valid @RequestBody ApplicationSignRequestDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            // ВИПРАВЛЕНО: Викликаємо правильний метод сервісу
            return ResponseEntity.ok(applicationService.signAndSubmitApplication(request, currentUser));
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Невірний пароль для підпису");
        }
    }

    /**
     * Перегляд моїх заявок.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('application:read_own')")
    public ResponseEntity<List<ApplicationResponseDto>> getMyApplications(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(applicationService.getMyApplications(currentUser));
    }

    /**
     * Перегляд деталей однієї заявки.
     */
    @GetMapping("/my/{id}")
    @PreAuthorize("hasAuthority('application:read_own')")
    public ResponseEntity<ApplicationResponseDto> getMyApplicationById(
            @PathVariable Integer id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(applicationService.getMyApplicationById(id, currentUser));
    }


    // === БЛОК ПЕРСОНАЛУ ===

    @GetMapping
    @PreAuthorize("hasAuthority('application:read')")
    public ResponseEntity<List<ApplicationResponseDto>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('application:read')")
    public ResponseEntity<ApplicationResponseDto> getApplicationById(@PathVariable Integer id) {
        return ResponseEntity.ok(applicationService.getApplicationDetailsAsStaff(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('application:update_status')")
    public ResponseEntity<ApplicationResponseDto> updateStatus(
            @PathVariable Integer id,
            @RequestBody ApplicationStatusUpdateDto dto,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, dto, currentUser));
    }

    /**
     * ПЕРЕВІРКА ПІДПИСУ (З аудитом)
     * Додано @AuthenticationPrincipal для фіксації перевіряючого.
     */
    @GetMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('application:verify_sign')")
    public ResponseEntity<ApplicationVerificationResponseDto> verifySign(
            @PathVariable Integer id,
            @AuthenticationPrincipal User currentUser // <--- Отримуємо того, хто перевіряє
    ) {
        // Передаємо два параметри: ID заявки та об'єкт користувача
        return ResponseEntity.ok(verificationService.verifyApplicationIntegrity(id, currentUser));
    }

}