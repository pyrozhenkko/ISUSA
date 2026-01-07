package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.LoginRequestDto;
import org.ccpc.isusa.dto.request.StaffCreateRequestDto;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.LoginResponseDto;
import org.ccpc.isusa.entity.main.User; // Додано імпорт
import org.ccpc.isusa.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Додано імпорт
import org.springframework.web.bind.annotation.*;

/**
 * "Вхідні ворота" (Публічний API).
 */
@RestController
@RequestMapping("/api/auth")
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
     * Ендпоінт для входу в систему.
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

    /**
     * Створення персоналу (Адмін, Деканат).
     * ЗМІНИ: Додано @AuthenticationPrincipal User admin.
     * Це дозволяє передати в сервіс інформацію про те, ХТО саме натиснув кнопку "Створити".
     */
    @PostMapping("/staff/create")
    @PreAuthorize("hasAuthority('user:manage')")
    public ResponseEntity<?> createAdmin(
            @Valid @RequestBody StaffCreateRequestDto request,
            @AuthenticationPrincipal User admin // Spring Security автоматично підставить сюди поточного адміна
    ) {
        // Передаємо адміна в сервіс для аудиту
        authService.createStaff(request, admin);
        return ResponseEntity.ok(request.getRole() + " створено");
    }
}