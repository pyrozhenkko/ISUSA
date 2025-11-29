package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import org.ccpc.isusa.dto.request.LoginRequestDto;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.LoginResponseDto;
import org.ccpc.isusa.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}