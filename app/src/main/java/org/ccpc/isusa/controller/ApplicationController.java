package org.ccpc.isusa.controller;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.ApplicationVerificationResponseDto;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.service.ApplicationService;
import org.ccpc.isusa.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контролер для керування заявками.
 * Реалізує логіку для Студентів (створення, перегляд своїх)
 * та Адмінів (перевірка підпису).
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final VerificationService verificationService;

    /**
     * (СТУДЕНТ) Створює, підписує паролем та подає нову заявку.
     */
    @PostMapping("/sign-and-submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponseDto> signAndSubmitApplication(
            @RequestBody ApplicationSignRequestDto request,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        ApplicationResponseDto response = applicationService.signAndSubmitApplication(request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * (СТУДЕНТ) Отримує список тільки СВОЇХ заявок.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ApplicationResponseDto>> getMyApplications(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        List<ApplicationResponseDto> applications = applicationService.getMyApplications(currentUser);
        return ResponseEntity.ok(applications);
    }

    /**
     * (СТУДЕНТ) Отримує одну СВОЮ заявку.
     */
    @GetMapping("/my/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponseDto> getMyApplicationById(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        User currentUser = (User) authentication.getPrincipal();
        ApplicationResponseDto application = applicationService.getMyApplicationById(id, currentUser);
        return ResponseEntity.ok(application);
    }

    /**
     * (АДМІН / ВИКЛАДАЧ / ДЕКАНАТ) Перевіряє криптографічний підпис заявки.
     */
    @GetMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'DEANERY_STAFF')")
    public ResponseEntity<ApplicationVerificationResponseDto> verifyApplicationSignature(
            @PathVariable Integer id
    ) {
        ApplicationVerificationResponseDto response = verificationService.verifyApplicationIntegrity(id);
        return ResponseEntity.ok(response);
    }
}