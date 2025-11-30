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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final VerificationService verificationService;

    // --- МЕТОДИ СТУДЕНТА ---

    @PostMapping("/sign-and-submit")
    @PreAuthorize("hasAuthority('application:create')")
    public ResponseEntity<ApplicationResponseDto> signAndSubmitApplication(
            @RequestBody ApplicationSignRequestDto request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(applicationService.signAndSubmitApplication(request, currentUser));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('application:read_own')")
    public ResponseEntity<List<ApplicationResponseDto>> getMyApplications(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(applicationService.getMyApplications(currentUser));
    }

    @GetMapping("/my/{id}")
    @PreAuthorize("hasAuthority('application:read_own')")
    public ResponseEntity<ApplicationResponseDto> getMyApplicationById(
            @PathVariable Integer id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(applicationService.getMyApplicationById(id, currentUser));
    }

    // --- МЕТОДИ АДМІНІСТРАЦІЇ ---

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

    @GetMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('application:verify_sign')")
    public ResponseEntity<ApplicationVerificationResponseDto> verifyApplicationSignature(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(verificationService.verifyApplicationIntegrity(id));
    }
}