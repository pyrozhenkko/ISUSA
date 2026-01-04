package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import org.ccpc.isusa.dto.request.LoginRequestDto;
import org.ccpc.isusa.dto.request.StaffCreateRequestDto;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.LoginResponseDto;
import org.ccpc.isusa.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

/**
 * "Вхідні ворота" (Публічний API).
 * Обробляє запити, які не потребують токена (вхід та реєстрація).
 * Доступ дозволено у SecurityConfig.java.
 */
@RestController
@RequestMapping("/api/auth") // Публічний URL
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Ендпоінт для публічної реєстрації нового СТУДЕНТА.
     */
    @PostMapping("/register/student")
    public ResponseEntity<LoginResponseDto> registerStudent(
            @Valid @RequestBody StudentRegistrationRequestDto request
    ) {
        return ResponseEntity.ok(authService.registerStudent(request));
    }

    /**
     * Ендпоінт для входу в систему (для всіх ролей: STUDENT, ADMIN, etc.).
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        authService.processForgotPassword(email);
        return ResponseEntity.ok("Лист для відновлення надіслано на вашу пошту");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Пароль успішно змінено");
    }
    @PostMapping("/staff/create")
    @PreAuthorize("hasAuthority('user:manage')")
    public ResponseEntity<?> createAdmin(
            @Valid @RequestBody StaffCreateRequestDto request
    ) {
        authService.createStaff(request);
        return ResponseEntity.ok(request.getRole() + " створено");
    }

}