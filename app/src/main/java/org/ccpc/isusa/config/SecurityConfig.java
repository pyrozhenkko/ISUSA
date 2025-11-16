package org.ccpc.isusa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

/**
 * Головний конфігураційний файл Spring Security.
 * Тут ми вмикаємо фільтри і визначаємо, які URL є публічними, а які - захищеними.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Дозволяє використовувати @PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Вимикаємо CSRF (стандартно для stateless API, що використовують токени)
                .csrf(csrf -> csrf.disable())

                // 2. Налаштовуємо правила доступу до URL
                .authorizeHttpRequests(auth -> auth
                        // Дозволяємо доступ до /api/auth/** (реєстрація, логін) для всіх
                        .requestMatchers("/api/auth/**").permitAll()
                        // Будь-який інший запит вимагає автентифікації
                        .anyRequest().authenticated()
                )

                // 3. Налаштовуємо управління сесіями - STATELESS (без сесій)
                // Ми використовуємо JWT, тому сервер не повинен зберігати сесії
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Підключаємо наш провайдер (з ApplicationConfig)
                .authenticationProvider(authenticationProvider)

                // 5. Додаємо наш JWT-фільтр ПЕРЕД стандартним фільтром Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}