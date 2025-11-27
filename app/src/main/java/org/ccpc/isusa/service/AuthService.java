package org.ccpc.isusa.service;

import org.ccpc.isusa.dto.request.LoginRequestDto;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.response.LoginResponseDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.Role;
import org.ccpc.isusa.entity.Student;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.exception.RegistrationException;
import org.ccpc.isusa.mapper.StudentMapper;
import org.ccpc.isusa.mapper.UserMapper;
import org.ccpc.isusa.repository.RoleRepository;
import org.ccpc.isusa.repository.StudentRepository;
import org.ccpc.isusa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * "Мозок" для всієї логіки, пов'язаної з реєстрацією та входом.
 * Використовується AuthController та AdminController.
 */
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

        // 8. Повертаємо токен і дані про юзера
        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(savedUser));
    }

    /**
     * Вхід існуючого користувача (для всіх ролей).
     */
    public LoginResponseDto login(LoginRequestDto request) {

        // 1. Spring Security перевіряє логін/пароль.
        // Якщо пароль невірний, тут буде кинуто виняток (BadCredentialsException).
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Якщо все добре, завантажуємо User з бази
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // 3. Генеруємо токен
        var jwtToken = jwtService.generateToken(user);

        // 4. Повертаємо токен і дані про юзера
        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(user));
    }


}