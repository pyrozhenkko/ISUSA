package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.request.UserUpdateRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.ChartDataDto;
import org.ccpc.isusa.dto.response.UserActivityReportDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.main.User; // Твоя сутність
import org.ccpc.isusa.repository.main.UserRepository;
import org.ccpc.isusa.service.AdminService;
import org.ccpc.isusa.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Для отримання виконавця
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", exposedHeaders = "X-Total-Count")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('user:manage')")
public class AdminController {

    private final AdminService adminService;
    private  final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    // --- СТВОРЕННЯ ---
    @PostMapping("/users/staff")
    public ResponseEntity<UserResponseDto> createStaff(
            @Valid @RequestBody UserCreateRequestDto request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        User performer = currentUserService.getCurrentUser(principal);
        return ResponseEntity.ok(adminService.createStaff(request, performer));
    }


    @PostMapping("/users/student")
    public ResponseEntity<UserResponseDto> createStudent(
            @Valid @RequestBody StudentRegistrationRequestDto request,
            @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(adminService.createStudent(request, admin));
    }

    // --- КЕРУВАННЯ ---

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Integer id,
            @RequestBody UserUpdateRequestDto request,
            @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(adminService.updateStaff(id, request, admin));
    }

    @PostMapping("/users/{id}/toggle-active")
    public ResponseEntity<UserResponseDto> toggleUserActive(
            @PathVariable Integer id,
            @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(adminService.toggleUserActive(id, admin));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User admin
    ) {
        adminService.resetPassword(id, body.get("newPassword"), admin);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Integer id,
            @AuthenticationPrincipal User admin
    ) {
        adminService.deleteUser(id, admin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/restore")
    public ResponseEntity<Void> restoreDeletedUser(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails principal // 1. Приймаємо UserDetails
    ) {
        // 2. Конвертуємо в сутність User через твій сервіс
        User admin = currentUserService.getCurrentUser(principal);

        // 3. Передаємо в сервіс
        adminService.restoreDeletedUser(id, admin);
        return ResponseEntity.ok().build();
    }

    // --- ПЕРЕГЛЯД ТА ЗВІТИ (Додаємо аудит перегляду) ---

    @GetMapping("/users/{id}/student-history")
    public ResponseEntity<UserActivityReportDto> getStudentHistory(
            @PathVariable Integer id,
            @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(adminService.getStudentHistory(id, admin));
    }

    @GetMapping("/users/{id}/staff-activity")
    public ResponseEntity<UserActivityReportDto> getStaffActivity(
            @PathVariable Integer id,
            @AuthenticationPrincipal User admin
    ) {
        return ResponseEntity.ok(adminService.getStaffActivityHistory(id, admin));
    }

    // --- МЕТОДИ БЕЗ ЗМІН (Тільки читання без спеціального аудиту) ---

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers(@RequestParam(required = false) String role) {
        return ResponseEntity.ok(adminService.getAllUsers(role));
    }

    @GetMapping("/users/deleted")
    public ResponseEntity<List<UserResponseDto>> getDeletedUsers() {
        return ResponseEntity.ok(adminService.getDeletedUsers());
    }

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponseDto>> getAllApplications() {
        return ResponseEntity.ok(adminService.getAllApplications());
    }


    // GET /api/admin/reports/chart?days=7
    // GET /api/admin/reports/chart?days=30
    @GetMapping("/reports/chart")
    public ResponseEntity<List<ChartDataDto>> getSystemChart(
            @RequestParam(defaultValue = "7") int days
    ) {
        return ResponseEntity.ok(adminService.getSystemHealthChart(days));
    }
}