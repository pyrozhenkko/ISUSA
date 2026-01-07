package org.ccpc.isusa.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent;
import org.ccpc.isusa.repository.main.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Додано для ін'єкції
@Slf4j
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository; // Потрібен, щоб знайти User Entity по UserDetails

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        // 1. ЛОГ: Генерація токена (Успішний логін)
        // Нам потрібно знайти Entity User, бо userDetails - це просто обгортка Spring Security
        User user = userRepository.findByEmail(userDetails.getUsername()) // Припускаю, що username = email
                .orElse(null);

        if (user != null) {
            publishAudit(user, "INFO", "Успішна авторизація (JWT згенеровано)", null);
        } else {
            log.warn("Генерується токен для користувача, якого немає в базі: {}", userDetails.getUsername());
        }

        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Тут ми не логуємо успіх в БД, бо це буде відбуватися 100 разів на хвилину.
        // Це створить "шум".
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts
                    .parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (SignatureException e) {
            // 2. ЛОГ: Хтось намагається підробити підпис токена!
            log.error("Invalid JWT signature: {}", e.getMessage());
            publishAudit(null, "SECURITY", "Спроба використання токена з невалідним підписом (можлива атака)", null);
            throw e;
        } catch (MalformedJwtException e) {
            // 3. ЛОГ: Токен поламаний
            log.warn("Invalid JWT token: {}", e.getMessage());
            publishAudit(null, "WARN", "Спроба використання пошкодженого токена", null);
            throw e;
        } catch (ExpiredJwtException e) {
            // Прострочений токен - це нормальна робоча ситуація, пишемо тільки в консоль/файл
            log.warn("JWT token is expired: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("JWT token validation failed", e);
            throw e;
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Допоміжний метод для аудиту.
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