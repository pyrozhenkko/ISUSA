package org.ccpc.isusa.service;

import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.dto.request.LoginRequestDto;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.response.LoginResponseDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.Role;
import org.ccpc.isusa.entity.Student;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.exception.RegistrationException;
import org.ccpc.isusa.mapper.StudentMapper;
import org.ccpc.isusa.mapper.UserMapper;
import org.ccpc.isusa.repository.RoleRepository;
import org.ccpc.isusa.repository.StudentRepository;
import org.ccpc.isusa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * "Мозок" для всієї логіки, пов'язаної з реєстрацією та входом.
 * Використовується AuthController та AdminController.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    // Репозиторії для доступу до бази
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;

    // Маппери для конвертації DTO <-> Entity
    private final UserMapper userMapper;
    private final StudentMapper studentMapper;

    // Інструменти Spring Security
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // Наш сервіс для JWT-токенів
    private final JwtService jwtService;

    private final ApplicationEventPublisher eventPublisher;

    // Роль за замовчуванням (з application.properties)
    @Value("${isusa.default-student-role-name}")
    private String STUDENT_ROLE_NAME;

    /**
     * Реєстрація нового користувача (студента).
     * @Transactional гарантує, що або User І Student будуть створені, або ніхто.
     */
    @Transactional
    public LoginResponseDto registerStudent(StudentRegistrationRequestDto request) {

        // 1. Валідація: Перевіряємо, чи вільні логін, email та ID студента
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RegistrationException("Користувач з таким логіном вже існує");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RegistrationException("Користувач з такою поштою вже існує");
        }
        if (userRepository.existsByStudentStudentId(request.getStudentId())) {
            throw new RegistrationException("Студент з таким ID (білетом) вже зареєстрований");
        }

        // 2. Створюємо User
        User user = userMapper.toUserEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); // Хешуємо пароль
        user.setIsActive(true);

        // 3. Встановлюємо роль
        Role studentRole = roleRepository.findByRoleName(STUDENT_ROLE_NAME)
                .orElseThrow(() -> new RuntimeException(
                        "Критична помилка: Роль '" + STUDENT_ROLE_NAME + "' не знайдена в базі даних. " +
                                "Перевір свій data.sql файл."));
        user.setRole(studentRole);

        // 4. Зберігаємо User (щоб отримати ID)
        User savedUser = userRepository.save(user);

        // 5. Створюємо Student
        Student student = studentMapper.toStudentEntity(request);
        student.setUser(savedUser); // Встановлюємо зв'язок

        // 6. Зберігаємо Student
        studentRepository.save(student);

        // 7. Генеруємо токен
        String jwtToken = jwtService.generateToken(savedUser);

        eventPublisher.publishEvent(new AuditEvent(
                this,
                savedUser,              // Хто: Новий користувач
                "INFO",                 // Рівень
                "Реєстрація нового студента", // Повідомлення
                "Student",              // Тип сутності
                request.getStudentId()  // ID сутності
        ));

        // 8. Повертаємо токен і дані про юзера
        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(savedUser));
    }

    /**
     * Вхід існуючого користувача.
     */
    public LoginResponseDto login(LoginRequestDto request) {
        try {
            // 1. Spring Security перевіряє логін/пароль
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            // --- ЛОГУВАННЯ (Помилка входу) ---
            // Це важливо для безпеки (brute-force attacks)
            // Примітка: Ми передаємо null у поле user, бо вхід не вдався,
            // але в повідомлення пишемо логін, який намагалися використати.
            eventPublisher.publishEvent(new AuditEvent(
                    this,
                    null, // Юзера не авторизовано
                    "WARN",
                    "Невдала спроба входу для логіна: " + request.getUsername(),
                    "Security",
                    null
            ));
            throw e; // Прокидаємо помилку далі, щоб контролер повернув 401/403
        }

        // 2. Якщо аутентифікація пройшла успішно -> дістаємо юзера
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // 3. Генеруємо токен
        var jwtToken = jwtService.generateToken(user);

        // --- ЛОГУВАННЯ (Успіх) ---
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                "INFO",
                "Успішний вхід в систему",
                "User", // Тип сутності (сесія юзера)
                user.getUserId()
        ));

        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(user));
    }
}