package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.request.UserUpdateRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.UserActivityReportDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('user:manage')") // Тільки АДМІН (або той, хто має право user:manage)
public class AdminController {

    private final AdminService adminService;

    // --- СТВОРЕННЯ ---

    @PostMapping("/users/staff")
    public ResponseEntity<UserResponseDto> createStaff(@Valid @RequestBody UserCreateRequestDto request) {
        return ResponseEntity.ok(adminService.createStaff(request));
    }

    @PostMapping("/users/student")
    public ResponseEntity<UserResponseDto> createStudent(@Valid @RequestBody StudentRegistrationRequestDto request) {
        return ResponseEntity.ok(adminService.createStudent(request));
    }

    // --- КЕРУВАННЯ ---

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Integer id,
            @RequestBody UserUpdateRequestDto request
    ) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @PostMapping("/users/{id}/toggle-active")
    public ResponseEntity<UserResponseDto> toggleUserActive(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.toggleUserActive(id));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body // {"newPassword": "..."}
    ) {
        adminService.resetPassword(id, body.get("newPassword"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/restore")
    public ResponseEntity<Void> restoreDeletedUser(@PathVariable Integer id) {
        adminService.restoreDeletedUser(id);
        return ResponseEntity.ok().build();
    }

    // --- ПЕРЕГЛЯД ТА ЗВІТИ ---

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

    @GetMapping("/users/{id}/student-history")
    public ResponseEntity<UserActivityReportDto> getStudentHistory(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getStudentHistory(id));
    }

    @GetMapping("/users/{id}/staff-activity")
    public ResponseEntity<UserActivityReportDto> getStaffActivity(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getStaffActivityHistory(id));
    }
}