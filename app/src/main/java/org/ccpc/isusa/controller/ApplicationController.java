package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.ApplicationDraftRequestDto;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.request.ApplicationStatusUpdateDto;
import org.ccpc.isusa.dto.request.SignExistingDraftDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.ApplicationVerificationResponseDto;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.service.ApplicationService;
import org.ccpc.isusa.service.VerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final VerificationService verificationService;

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
     * Редагувати ЧЕРНЕТКУ (Якщо вже підписана - буде помилка).
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
        return ResponseEntity.ok(applicationService.signExistingDraft(id, request.getPassword(), currentUser));
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
        return ResponseEntity.ok(applicationService.createAndSignApplication(request, currentUser));
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

    @GetMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('application:verify_sign')")
    public ResponseEntity<ApplicationVerificationResponseDto> verifySign(@PathVariable Integer id) {
        return ResponseEntity.ok(verificationService.verifyApplicationIntegrity(id));
    }
}