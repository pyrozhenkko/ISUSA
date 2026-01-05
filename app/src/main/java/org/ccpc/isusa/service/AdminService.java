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

import java.time.LocalDateTime;
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

        // ОНОВЛЕНИЙ ВИКЛИК
        User user = createUserEntity(
                request.getUsername(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName(),
                request.getMiddleName(),
                request.getEmail(),
                role,
                request.getFaculty(),
                request.getDepartment(),
                request.getPosition()
        );

        User savedUser = userRepository.save(user);

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
        userDeletionService.softDeleteUser(userId, performer);
    }

    /**
     * Відновлення видаленого користувача.
     */
    public void restoreDeletedUser(Integer userId, User performer) {
        // Використовуємо спеціальний метод пошуку
        User user = userRepository.findUserEvenIfDeleted(userId)
                .orElseThrow(() -> new EntityNotFoundException("Користувача не знайдено (навіть серед видалених)"));

        if (!user.getIsDeleted()) {
            log.warn("Користувач не видалений: {}", user.getUsername());
            // Можна просто повернутися, якщо він вже активний, щоб не кидати помилку
            return;
        }

        user.setIsDeleted(false);
        user.setDeletedDate(null);
        user.setIsActive(true);

        userRepository.save(user);
        log.info("Користувач відновлений: {} (ID: {})", user.getUsername(), userId);

        publishAudit(performer, "INFO", "Користувача успішно відновлено: " + user.getUsername(), userId);
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
    public UserResponseDto updateStaff(Integer userId, UserUpdateRequestDto request, User performer) {
        User user = getUserOrThrow(userId);

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }
        if (request.getMiddleName() != null) {
            user.setMiddleName(request.getMiddleName());
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!user.getUsername().equals(request.getUsername()) && userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RegistrationException("Username '" + request.getUsername() + "' already taken");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RegistrationException("Email '" + request.getEmail() + "' already taken");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getFaculty() != null) user.setFaculty(request.getFaculty());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getPosition() != null) user.setPosition(request.getPosition());

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth().atStartOfDay());
        }
        if (request.getEnrolledDate() != null) {
            user.setEnrolledDate(request.getEnrolledDate());
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

    private User createUserEntity(
            String username,
            String password,
            String firstName,
            String lastName,
            String middleName,
            String email,
            Role role,
            String faculty,
            String department,
            String position    ) {
        User user = new User();

        // 1. Основні дані
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));

        // 2. Встановлюємо імена напряму (без розбиття split)
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setMiddleName(middleName);

        // 3. Налаштування акаунта
        user.setRole(role);
        user.setIsActive(true);

        // 4. Дефолтні значення (безпека)
        user.setFailedLoginAttempts(0);
        user.setIsDeleted(false);
        user.setPasswordChangedDate(LocalDateTime.now());

        // 5. Професійні дані
        user.setFaculty(faculty);
        user.setDepartment(department);
        user.setPosition(position);

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