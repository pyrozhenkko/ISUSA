package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

/**
 * "Панель Адміна" (Приватний API).
 * Доступ до всіх методів тут дозволено ТІЛЬКИ для ролі 'ADMIN'.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Захист на рівні всього класу
public class AdminController {

    private final AuthService authService;
    // (Тут також будуть інші сервіси, напр. UserService,
    // коли ти реалізуєш логіку блокування/видалення юзерів)

    /**
     * Ендпоінт для Адміна, щоб створити нового співробітника
     * (напр., іншого Адміна, Викладача або Співробітника Деканату).
     */
    @PostMapping("/users/create")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserCreateRequestDto request) {
        return ResponseEntity.ok(authService.createUser(request));
    }
}