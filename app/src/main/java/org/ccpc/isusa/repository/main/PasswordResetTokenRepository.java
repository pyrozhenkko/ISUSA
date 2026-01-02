package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.PasswordResetToken;
import org.ccpc.isusa.entity.main.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}