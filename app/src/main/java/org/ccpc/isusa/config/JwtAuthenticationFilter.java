package org.ccpc.isusa.config;

import org.ccpc.isusa.service.JwtService;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;

/**
 * Фільтр, який спрацьовує на КОЖЕН запит.
 * Його завдання - перевірити заголовок "Authorization", знайти JWT-токен,
 * валідувати його і повідомити Spring Security, хто цей користувач.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Ми його визначили в ApplicationConfig

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // нема заголовка або не починається з "Bearer " - це не JWT.
        // Передаємо запит далі по ланцюжку фільтрів.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        //  Вирізаємо "Bearer " і отримуємо чистий токен
        jwt = authHeader.substring(7); // "Bearer ".length()
        username = jwtService.extractUsername(jwt);

        //  Якщо ми отримали ім'я, АЛЕ користувач ще не в системі (в SecurityContext)
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Завантажуємо користувача з бази
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            //  Перевіряємо, чи валідний токен
            if (jwtService.isTokenValid(jwt, userDetails)) {
                //  Якщо токен валідний - створюємо об'єкт автентифікації
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // credentials (пароль) нам вже не потрібен
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                //  Зберігаємо користувача у SecurityContext.
                // Spring Security тепер знає, хто цей користувач.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        //  Передаємо запит далі
        filterChain.doFilter(request, response);
    }
}