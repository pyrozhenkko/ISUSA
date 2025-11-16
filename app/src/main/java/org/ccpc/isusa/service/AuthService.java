package org.ccpc.isusa.service;

import org.ccpc.isusa.dto.request.LoginRequestDto;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.LoginResponseDto;
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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final UserMapper userMapper;
    private final StudentMapper studentMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${isusa.default-student-role-name}")
    private String STUDENT_ROLE_NAME;

    /**
     * Реєстрація нового користувача (студента).
     * @Transactional гарантує, що або User І Student будуть створені, або ніхто.
     */
    @Transactional
    public LoginResponseDto registerStudent(StudentRegistrationRequestDto request) {

        // перевірка блфн, чи вільні логін та email
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RegistrationException("Користувач з таким логіном вже існує");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RegistrationException("Користувач з такою поштою вже існує");
        }

        //  Створюємо User
        User user = userMapper.toUserEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);

        //  Встановлюємо роль
        Role studentRole = roleRepository.findByRoleName(STUDENT_ROLE_NAME)
                .orElseThrow(() -> new RuntimeException(
                        "Критична помилка: Роль '" + STUDENT_ROLE_NAME + "' не знайдена в базі даних. " +
                                "Перевір свій data.sql файл."));
        user.setRole(studentRole);

        //  Зберігаємо User
        User savedUser = userRepository.save(user);

        //  Створюємо Student
        Student student = studentMapper.toStudentEntity(request);
        student.setUser(savedUser); // Встановлюємо зв'язок

        //  Зберігаємо Student
        studentRepository.save(student);

        //  Генеруємо токен
        String jwtToken = jwtService.generateToken(savedUser);

        //  Повертаємо токен і дані про юзера
        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(savedUser));
    }

    /**
     * Вхід існуючого користувача.
     */
    public LoginResponseDto login(LoginRequestDto request) {
        // перевірка логінів та паролів секуріті
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));

        // генерація токена жоска магія
        var jwtToken = jwtService.generateToken(user);

        // повернення токена
        return new LoginResponseDto(jwtToken, userMapper.toResponseDto(user));
    }
}