package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.Role;
import org.ccpc.isusa.entity.Student;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.exception.RegistrationException;
import org.ccpc.isusa.mapper.ApplicationMapper;
import org.ccpc.isusa.mapper.StudentMapper;
import org.ccpc.isusa.mapper.UserMapper;
import org.ccpc.isusa.repository.ApplicationRepository;
import org.ccpc.isusa.repository.RoleRepository;
import org.ccpc.isusa.repository.StudentRepository;
import org.ccpc.isusa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;

    private final UserMapper userMapper;
    private final StudentMapper studentMapper;
    private final ApplicationMapper applicationMapper;

    private final PasswordEncoder passwordEncoder;

    @Value("${isusa.default-student-role-name}")
    private String STUDENT_ROLE_NAME;

    /**
     * Створення співробітника (ADMIN, TEACHER, DEANERY_STAFF).
     */
    @Transactional
    public UserResponseDto createStaff(UserCreateRequestDto request) {
        validateNewUser(request.getUsername(), request.getEmail());

        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new RegistrationException("Роль '" + request.getRoleName() + "' не знайдена."));

        // Забороняємо створювати студентів через цей метод (для них є окремий)
        if (role.getRoleName().equals(STUDENT_ROLE_NAME)) {
            throw new RegistrationException("Для створення студентів використовуйте окремий метод.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setRole(role);

        return userMapper.toResponseDto(userRepository.save(user));
    }

    /**
     * Створення студента Адміном.
     */
    @Transactional
    public UserResponseDto createStudent(StudentRegistrationRequestDto request) {
        validateNewUser(request.getUsername(), request.getEmail());
        if (userRepository.existsByStudentStudentId(request.getStudentId())) {
            throw new RegistrationException("Студент з таким ID вже існує");
        }

        Role studentRole = roleRepository.findByRoleName(STUDENT_ROLE_NAME)
                .orElseThrow(() -> new RuntimeException("Роль STUDENT не знайдена"));

        User user = userMapper.toUserEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(studentRole);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        Student student = studentMapper.toStudentEntity(request);
        student.setUser(savedUser);
        studentRepository.save(student);

        return userMapper.toResponseDto(savedUser);
    }

    /**
     * Видалення будь-якого користувача за ID.
     */
    @Transactional
    public void deleteUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Користувача з ID " + userId + " не знайдено");
        }
        // Каскадне видалення (якщо налаштовано в БД) або ручне видалення залежностей
        userRepository.deleteById(userId);
    }

    /**
     * Отримання списку користувачів (можна фільтрувати за роллю).
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers(String roleNameFilter) {
        List<User> users;
        if (roleNameFilter != null && !roleNameFilter.isEmpty()) {
            Role role = roleRepository.findByRoleName(roleNameFilter)
                    .orElseThrow(() -> new EntityNotFoundException("Роль не знайдена"));
            users = userRepository.findByRole(role); // Тобі треба додати цей метод в UserRepository
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Отримання списку ВСІХ заявок (для адмінської панелі).
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    private void validateNewUser(String username, String email) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RegistrationException("Користувач з таким логіном вже існує");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RegistrationException("Користувач з такою поштою вже існує");
        }
    }
}