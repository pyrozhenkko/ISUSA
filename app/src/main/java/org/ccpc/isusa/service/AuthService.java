package org.ccpc.isusa.service;

import org.ccpc.isusa.dto.request.LoginRequestDto;
import org.ccpc.isusa.dto.request.StaffCreateRequestDto;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.LoginResponseDto;
import org.ccpc.isusa.entity.main.PasswordResetToken;
import org.ccpc.isusa.entity.main.Role;
import org.ccpc.isusa.entity.main.Student;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent; // Додано для подій
import org.ccpc.isusa.exception.RegistrationException;
import org.ccpc.isusa.mapper.StudentMapper;
import org.ccpc.isusa.mapper.UserMapper;
import org.ccpc.isusa.repository.main.PasswordResetTokenRepository;
import org.ccpc.isusa.repository.main.RoleRepository;
import org.ccpc.isusa.repository.main.StudentRepository;
import org.ccpc.isusa.repository.main.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher; // Додано паблішер
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Додано для логів в консоль

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * "Мозок" для всієї логіки, пов'язаної з реєстрацією та входом.
 * Використовується AuthController та AdminController.
 */
@Service
@RequiredArgsConstructor
@Slf4j // Додаємо логування Slf4j
public class AuthService {

    // Репозиторії для доступу до бази
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final PasswordResetTokenRepository tokenRepository;

    // Маппери для конвертації DTO <-> Entity
    private final UserMapper userMapper;
    private final StudentMapper studentMapper;

    // Інструменти Spring Security
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // Наш сервіс для JWT-токенів
    private final JwtService jwtService;

    // Сервіс для безпеки аутентифікації
    private final AuthSecurityService authSecurityService;

    // Сервіс для скидання пароля
    private final EmailService emailService;

    // Публікація подій аудиту
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

        // АУДИТ: Успішна реєстрація
        publishAudit(savedUser, "INFO", "Зареєстровано нового студента", savedUser.getUserId());

        // 7. Генеруємо токен
        String jwtToken = jwtService.generateToken(savedUser);

        // 8. Повертаємо токен і дані про юзера
        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(savedUser));
    }

    /**
     * Вхід існуючого користувача (для всіх ролей).
     * З защитою від brute-force атак та перевіркою soft-delete.
     */
    @Transactional
    public LoginResponseDto login(LoginRequestDto request) {

        // 1. Завантажуємо User за username (тільки не видалених)
        var user = userRepository.findByUsernameAndNotDeleted(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено або видалено"));

        // 2. Перевіряємо, чи акаунт заблокований
        if (authSecurityService.isAccountLocked(user)) {
            // АУДИТ: Блокування
            publishAudit(user, "SECURITY", "Відмова у вході: акаунт тимчасово заблоковано", null);
            throw new SecurityException("Акаунт заблокований на 15 хвилин через багато невдалих спроб входу");
        }

        // 3. Перевіряємо, чи активний користувач
        if (!user.getIsActive()) {
            publishAudit(user, "WARN", "Спроба входу в деактивований акаунт", null);
            throw new SecurityException("Акаунт деактивований. Зверніться до адміністратора");
        }

        // 4. Spring Security перевіряє логін/пароль.
        // Якщо пароль невірний, тут буде кинуто виняток (BadCredentialsException).
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            // Реєструємо невдалу спробу входу
            authSecurityService.recordFailedLogin(user);
            // АУДИТ: Невдалий вхід
            publishAudit(user, "WARN", "Невдала спроба входу (невірний пароль)", null);
            throw new SecurityException("Невірне ім'я користувача або пароль");
        }

        // 5. Якщо все добре - реєструємо успішний вхід
        authSecurityService.recordSuccessfulLogin(user);

        // 6. Перевіряємо, чи пароль не дійсний (не змінювався більше 90 днів)
        if (authSecurityService.isPasswordExpired(user)) {
            publishAudit(user, "WARN", "Вхід з простроченим паролем (вимагається зміна)", null);
            // Генеруємо токен з обмеженими правами для зміни пароля
            var jwtToken = jwtService.generateToken(user);
            // У відповіді повідомляємо, що потрібна зміна пароля
            return new LoginResponseDto(jwtToken, userMapper.toResponseDto(user));
        }

        // 7. Генеруємо токен
        var jwtToken = jwtService.generateToken(user);

        // 8. Повертаємо токен і дані про юзера
        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(user));
    }


    @Transactional
    public void processForgotPassword(String email) {
        // 1. Шукаємо юзера за email
        User user = userRepository.findByEmailAndNotDeleted(email)
                .orElseThrow(() -> new RuntimeException("Користувача з такою поштою не знайдено"));

        // 2. Видаляємо старі токени цього юзера, якщо вони були
        tokenRepository.deleteByUser(user);

        // 3. Генеруємо новий токен
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        // 4. Відправляємо лист
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        // АУДИТ: Запит відновлення
        publishAudit(user, "INFO", "Ініційовано процедуру відновлення пароля", null);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 1. Перевіряємо токен
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Невірний або недійсний токен"));

        // 2. Перевіряємо термін дії
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Термін дії токена вичерпано");
        }

        // 3. Оновлюємо пароль юзера
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword)); // Використовуємо твій BCrypt
        user.setPasswordChangedDate(LocalDateTime.now());
        userRepository.save(user);

        // 4. Видаляємо використаний токен
        tokenRepository.delete(resetToken);

        // АУДИТ: Зміна пароля
        publishAudit(user, "SECURITY", "Пароль успішно змінено через відновлення", null);
    }

    @Transactional
    public void createStaff(StaffCreateRequestDto request, User creator) { // ДОДАНО: User creator

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        Role role = null;
        if (request.getRole().equals("ADMIN")) {
            role = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
        }
        if (request.getRole().equals("DEANERY_STAFF")) {
            role = roleRepository.findByRoleName("DEANERY_STAFF")
                    .orElseThrow(() -> new RuntimeException("DEANERY_STAFF role not found"));

        }

        User user = new User();

        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setMiddleName(request.getMiddleName());

        user.setFaculty(request.getFaculty());
        user.setDepartment(request.getDepartment());
        user.setPosition(request.getPosition());

        user.setPhoneNumber(
                request.getPhoneNumber() != null ? request.getPhoneNumber() : "N/A"
        );

        user.setDateOfBirth(request.getDateOfBirth());
        user.setRole(role);

        user.setIsActive(true);
        user.setIsDeleted(false);
        user.setFailedLoginAttempts(0);
        user.setPasswordChangedDate(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // АУДИТ: Створення персоналу
        publishAudit(creator, "INFO",
                "Створено нового співробітника: " + savedUser.getUsername() + " (" + request.getRole() + ")",
                savedUser.getUserId());
    }

    /**
     * Допоміжний метод для надсилання подій аудиту.
     * EntityType = "Auth"
     */
    private void publishAudit(User user, String level, String message, Integer entityId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                user,
                level,
                message,
                "Auth",
                entityId
        ));
    }
}