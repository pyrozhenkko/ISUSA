package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.event.AuditEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final ApplicationEventPublisher eventPublisher; // 1. Ін'єкція

    @Value("${isusa.mail.from}")
    private String fromEmail;

    /**
     * Відправляє повідомлення про зміну статусу.
     * УВАГА: Я додав параметр 'Integer applicationId', щоб прив'язати лог до заявки.
     * Тобі потрібно буде оновити виклик цього методу в ApplicationService.
     */
    @Async
    public void sendStatusChangeNotification(String toEmail, String studentName, String applicationTitle, String newStatus, String comment, Integer applicationId) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ISUSA: Зміна статусу заявки");

            String body = String.format(
                    "Вітаємо, %s!\n\n" +
                            "Статус вашої заявки '%s' було змінено.\n" +
                            "Новий статус: %s\n\n" +
                            "Коментар деканату: %s\n\n" +
                            "Зайдіть у систему для деталей.",
                    studentName, applicationTitle, newStatus, (comment != null ? comment : "-")
            );

            message.setText(body);
            mailSender.send(message);

            log.info("Email sent to {}", toEmail);

            // 2. ЛОГ: Успішна відправка (Системна подія)
            publishAudit("INFO", "Email про зміну статусу відправлено на " + toEmail, "System_Mail", applicationId);

        } catch (Exception e) {
            log.error("Failed to send email to {}", toEmail, e);

            // 3. ЛОГ: Помилка відправки (Це важливо бачити адміну!)
            publishAudit("ERROR", "Не вдалося відправити Email: " + e.getMessage(), "System_Mail", applicationId);
        }
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ISUSA: Відновлення пароля");

            String resetLink = "http://localhost:5173/reset-password?token=" + token;

            String body = "Ви затребували відновлення пароля.\n\n" +
                    "Для встановлення нового пароля перейдіть за посиланням:\n" +
                    resetLink + "\n\n" +
                    "Це посилання дійсне 15 хвилин.";

            message.setText(body);
            mailSender.send(message);

            log.info("Reset email sent to {}", toEmail);

            // ЛОГ: Відправка токена відновлення
            // EntityId = null, бо ми ще не знаємо ID юзера в цьому контексті, або це не критично
            publishAudit("INFO", "Email для відновлення пароля відправлено на " + toEmail, "System_Mail", null);

        } catch (Exception e) {
            log.error("Failed to send reset email to {}", toEmail, e);
            publishAudit("ERROR", "Помилка відправки Email відновлення: " + e.getMessage(), "System_Mail", null);
        }
    }

    /**
     * Спрощений метод для системних подій (User = null)
     */
    private void publishAudit(String level, String message, String entityType, Integer entityId) {
        eventPublisher.publishEvent(new AuditEvent(
                this,
                null, // User is null -> System Action
                level,
                message,
                entityType,
                entityId
        ));
    }
}