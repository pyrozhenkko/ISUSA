package org.ccpc.isusa.service;

import org.ccpc.isusa.dto.request.UserCreateRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.Role;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.exception.RegistrationException;
import org.ccpc.isusa.mapper.StudentMapper;
import org.ccpc.isusa.mapper.UserMapper;
import org.ccpc.isusa.repository.RoleRepository;
import org.ccpc.isusa.repository.StudentRepository;
import org.ccpc.isusa.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Спеціальний сервіс для адміна, який дозволяє додавати нових
 * користувачів, з ізольованими ролями
 */

@Service
@RequiredArgsConstructor
public class AdminService {

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

    /**
     * Створення нового користувача (співробітника) Адміністратором.
     */
    @Transactional
    public UserResponseDto createUser(UserCreateRequestDto request) {
        // 1. Валідація
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RegistrationException("Користувач з таким логіном вже існує");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RegistrationException("Користувач з такою поштою вже існує");
        }

        // 2. Знаходимо Роль
        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new RegistrationException(
                        "Роль '" + request.getRoleName() + "' не знайдена."));

        // 3. Створюємо User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setRole(role);

        // 4. Зберігаємо User
        User savedUser = userRepository.save(user);

        // 5. Повертаємо DTO (без токену, бо ми не логінимо цього юзера)
        return userMapper.toResponseDto(savedUser);
    }
}
