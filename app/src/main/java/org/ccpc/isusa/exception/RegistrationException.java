package org.ccpc.isusa.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Спеціалізована помилка, яка буде повертати HTTP 400 (Bad Request)
 * у разі невдалої реєстрації (напр., "користувач вже існує").
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class RegistrationException extends RuntimeException {
    public RegistrationException(String message) {
        super(message);
    }
}