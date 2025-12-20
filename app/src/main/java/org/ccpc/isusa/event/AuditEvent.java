package org.ccpc.isusa.event;

import lombok.Getter;
import org.ccpc.isusa.entity.main.User;
import org.springframework.context.ApplicationEvent;

@Getter
public class AuditEvent extends ApplicationEvent {
    private final User user;
    private final String level;      // "INFO", "WARN", "ERROR"
    private final String message;    // Опис дії
    private final String entityType; // Наприклад: "Student", "Application"
    private final Integer entityId;  // ID об'єкта (наприклад: 105)

    public AuditEvent(Object source, User user, String level, String message, String entityType, Integer entityId) {
        super(source);
        this.user = user;
        this.level = level;
        this.message = message;
        this.entityType = entityType;
        this.entityId = entityId;
    }
}