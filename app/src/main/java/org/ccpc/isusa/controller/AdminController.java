package org.ccpc.isusa.controller;

import jakarta.validation.Valid;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Весь контролер тільки для Адміна
public class AdminController {

    private final AdminService adminService;

    // --- КЕРУВАННЯ КОРИСТУВАЧАМИ ---

    @PostMapping("/users/staff")
    public ResponseEntity<UserResponseDto> createStaff(@Valid @RequestBody UserCreateRequestDto request) {
        return ResponseEntity.ok(adminService.createStaff(request));
    }

    @PostMapping("/users/student")
    public ResponseEntity<UserResponseDto> createStudent(@Valid @RequestBody StudentRegistrationRequestDto request) {
        return ResponseEntity.ok(adminService.createStudent(request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Отримати всіх користувачів (можна фільтрувати: ?role=STUDENT)
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers(@RequestParam(required = false) String role) {
        return ResponseEntity.ok(adminService.getAllUsers(role));
    }

    // --- ПЕРЕГЛЯД ЗАЯВОК ---

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationResponseDto>> getAllApplications() {
        return ResponseEntity.ok(adminService.getAllApplications());
    }
}