package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.request.UserUpdateRequestDto;
import org.ccpc.isusa.dto.response.*;
import org.ccpc.isusa.entity.main.*;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.exception.RegistrationException;
import org.ccpc.isusa.mapper.*;
import org.ccpc.isusa.repository.main.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository historyRepository;

    private final UserMapper userMapper;
    private final StudentMapper studentMapper;
    private final ApplicationMapper applicationMapper;
    private final ApplicationHistoryMapper historyMapper;

    private final PasswordEncoder passwordEncoder;

    // Сервіс для soft-delete користувачів
    private final UserDeletionService userDeletionService;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${isusa.default-student-role-name}")
    private String STUDENT_ROLE_NAME;

    // --- СТВОРЕННЯ КОРИСТУВАЧІВ ---

    /**
     * Створення СПІВРОБІТНИКА (Admin, Teacher, Deanery).
     */
    @Transactional
    public UserResponseDto createStaff(UserCreateRequestDto request, User performer) {
        validateUserNotExists(request.getUsername(), request.getEmail());
        Role role = getRoleOrThrow(request.getRoleName());

        if (role.getRoleName().equals(STUDENT_ROLE_NAME)) {
            throw new RegistrationException("Для створення студентів використовуйте createStudent");
        }

        User user = createUserEntity(request.getUsername(), request.getPassword(), request.getFullName(), request.getEmail(), role);
        User savedUser = userRepository.save(user);

        // ЛОГ: Створення персоналу
        publishAudit(performer, "INFO", "Створено нового співробітника: " + savedUser.getUsername() + " (Роль: " + role.getRoleName() + ")", savedUser.getUserId());

        return userMapper.toResponseDto(savedUser);
    }

    /**
     * Створення СТУДЕНТА Адміном.
     */
    @Transactional
    public UserResponseDto createStudent(StudentRegistrationRequestDto request, User performer) {
        validateUserNotExists(request.getUsername(), request.getEmail());
        if (userRepository.existsByStudentStudentId(request.getStudentId())) {
            throw new RegistrationException("Student ID зайнятий");
        }

        Role studentRole = getRoleOrThrow(STUDENT_ROLE_NAME);
        User user = userMapper.toUserEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(studentRole);
        user.setIsActive(true);
        User savedUser = userRepository.save(user);

        Student student = studentMapper.toStudentEntity(request);
        student.setUser(savedUser);
        studentRepository.save(student);

        // ЛОГ: Створення студента
        publishAudit(performer, "INFO", "Адміністратор створив профіль студента: " + savedUser.getUsername(), savedUser.getUserId());

        return userMapper.toResponseDto(savedUser);
    }

    // --- КЕРУВАННЯ АКАУНТАМИ ---

    /**
     * Soft-delete користувача (логічне видалення).
     * Замість видалення з бази, помічаємо як видаленого.
     */
    @Transactional
    public void deleteUser(Integer userId, User performer) {
        // Виклик оновленого UserDeletionService з performer
        userDeletionService.softDeleteUser(userId, performer);
    }

    /**
     * Відновлення видаленого користувача.
     */
    @Transactional
    public void restoreDeletedUser(Integer userId, User performer) {
        // Виклик оновленого UserDeletionService з performer
        userDeletionService.restoreDeletedUser(userId, performer);
    }

    @Transactional
    public UserResponseDto toggleUserActive(Integer userId, User performer) {
        User user = getUserOrThrow(userId);
        user.setIsActive(!user.getIsActive());
        User savedUser = userRepository.save(user);

        String status = savedUser.getIsActive() ? "Активовано" : "Деактивовано";
        publishAudit(performer, "INFO", status + " користувача: " + savedUser.getUsername(), userId);

        return userMapper.toResponseDto(savedUser);
    }

    @Transactional
    public UserResponseDto updateUser(Integer userId, UserUpdateRequestDto request, User performer) {
        User user = getUserOrThrow(userId);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }

        User savedUser = userRepository.save(user);
        publishAudit(performer, "INFO", "Оновлено профіль користувача: " + savedUser.getUsername(), userId);

        return userMapper.toResponseDto(savedUser);
    }

    @Transactional
    public void resetPassword(Integer userId, String newPassword, User performer) {
        User user = getUserOrThrow(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // ЛОГ: Подія безпеки (скидання пароля)
        publishAudit(performer, "SECURITY", "Адміністратор скинув пароль для користувача: " + user.getUsername(), userId);
    }

    // --- ПЕРЕГЛЯД ТА ЗВІТИ ---

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers(String roleName) {
        List<User> users;
        if (roleName != null && !roleName.isBlank()) {
            Role role = getRoleOrThrow(roleName);
            // Отримуємо тільки активних користувачів за роллю
            users = userRepository.findByRoleAndNotDeleted(role);
        } else {
            // Отримуємо всіх активних користувачів
            users = userRepository.findAllActive();
        }
        return users.stream().map(userMapper::toResponseDto).collect(Collectors.toList());
    }

    /**
     * Отримати видалених користувачів (для адміністративних цілей)
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getDeletedUsers() {
        return userRepository.findAllDeleted().stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Отримати всі заявки (для адмінської таблиці).
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Звіт по Студенту (всі його заявки).
     */
    @Transactional(readOnly = true)
    public UserActivityReportDto getStudentHistory(Integer userId, User performer) {
        User user = getUserOrThrow(userId);
        if (!"STUDENT".equals(user.getRole().getRoleName())) {
            throw new IllegalArgumentException("Цей користувач не є студентом");
        }
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Student profile not found"));

        List<Application> apps = applicationRepository.findByStudent(student);

        publishAudit(performer, "INFO", "Перегляд звіту по активності студента (ID: " + userId + ")", userId);

        return UserActivityReportDto.builder()
                .user(userMapper.toResponseDto(user))
                .totalApplications(apps.size())
                .applications(apps.stream().map(applicationMapper::toResponseDto).collect(Collectors.toList()))
                .build();
    }

    /**
     * Звіт по Працівнику (історія його дій).
     */
    @Transactional(readOnly = true)
    public UserActivityReportDto getStaffActivityHistory(Integer userId, User performer) {
        User user = getUserOrThrow(userId);
        List<ApplicationHistory> history = historyRepository.findByChangedByUser(user);

        publishAudit(performer, "INFO", "Перегляд звіту по активності співробітника (ID: " + userId + ")", userId);

        return UserActivityReportDto.builder()
                .user(userMapper.toResponseDto(user))
                .totalApplications(history.size())
                .history(historyMapper.toDtoList(history))
                .build();
    }

    // --- ХЕЛПЕРИ ---

    private User createUserEntity(String username, String password, String fullName, String email, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setIsActive(true);
        user.setRole(role);
        return user;
    }

    private void validateUserNotExists(String username, String email) {
        if (userRepository.findByUsername(username).isPresent()) throw new RegistrationException("Username taken");
        if (userRepository.findByEmail(email).isPresent()) throw new RegistrationException("Email taken");
    }

    private Role getRoleOrThrow(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new EntityNotFoundException("Role '" + roleName + "' not found"));
    }

    private User getUserOrThrow(Integer id) {
        return userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private void publishAudit(User performer, String level, String message, Integer targetId) {
        eventPublisher.publishEvent(new AuditEvent(this, performer, level, message, "User", targetId));
    }
}