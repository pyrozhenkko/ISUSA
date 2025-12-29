package org.ccpc.isusa.controller;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.response.ApplicationStatusResponseDto;
import org.ccpc.isusa.dto.response.ApplicationTypeResponseDto;
import org.ccpc.isusa.dto.response.RoleResponseDto;
import org.ccpc.isusa.entity.main.User; // Додано імпорт твоєї сутності
import org.ccpc.isusa.service.ReferenceDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Додано для аудиту
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReferenceDataController {

    private final ReferenceDataService referenceDataService;

    /**
     * Отримати список всіх ролей.
     */
    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponseDto>> getAllRoles(
            @AuthenticationPrincipal User user // <--- Отримуємо поточного користувача
    ) {
        // Передаємо користувача в сервіс для логування
        return ResponseEntity.ok(referenceDataService.getAllRoles(user));
    }

    /**
     * Отримати список всіх статусів заявок.
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<ApplicationStatusResponseDto>> getAllApplicationStatuses(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(referenceDataService.getAllApplicationStatuses(user));
    }

    /**
     * Отримати список всіх типів заявок.
     */
    @GetMapping("/types")
    public ResponseEntity<List<ApplicationTypeResponseDto>> getAllApplicationTypes(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(referenceDataService.getAllApplicationTypes(user));
    }
}