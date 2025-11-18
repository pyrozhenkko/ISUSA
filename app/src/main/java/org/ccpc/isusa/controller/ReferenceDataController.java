package org.ccpc.isusa.controller;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.response.ApplicationStatusResponseDto;
import org.ccpc.isusa.dto.response.ApplicationTypeResponseDto;
import org.ccpc.isusa.dto.response.RoleResponseDto;
import org.ccpc.isusa.service.ReferenceDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * "Довідник" (Приватний API).
 * Надає списки для випадаючих меню (dropdowns) у React.
 * Доступний для БУДЬ-ЯКОГО залогіненого користувача (студента, адміна тощо).
 */
@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()") // Доступний для ВСІХ, хто має валідний токен
public class ReferenceDataController {

    private final ReferenceDataService referenceDataService;

    /**
     * Отримати список всіх ролей (напр., для форми створення юзера адміном).
     */
    @GetMapping("/roles")
    public ResponseEntity<List<RoleResponseDto>> getAllRoles() {
        return ResponseEntity.ok(referenceDataService.getAllRoles());
    }

    /**
     * Отримати список всіх статусів заявок (для адміна).
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<ApplicationStatusResponseDto>> getAllApplicationStatuses() {
        return ResponseEntity.ok(referenceDataService.getAllApplicationStatuses());
    }

    /**
     * Отримати список всіх типів заявок (для студента при створенні заявки).
     */
    @GetMapping("/types")
    public ResponseEntity<List<ApplicationTypeResponseDto>> getAllApplicationTypes() {
        return ResponseEntity.ok(referenceDataService.getAllApplicationTypes());
    }
}