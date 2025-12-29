package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${isusa.mail.from}")
    private String fromEmail;

    /**
     * Відправляє простий текстовий лист.
     * @Async означає, що метод виконається в окремому потоці,
     * щоб не гальмувати відповідь користувачу.
     */
    @Async
    public void sendStatusChangeNotification(String toEmail, String studentName, String applicationTitle, String newStatus, String comment) {
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
        } catch (Exception e) {
            log.error("Failed to send email to {}", toEmail, e);
            // Ми не кидаємо помилку далі, щоб не скасовувати транзакцію зміни статусу,
            // якщо просто впав поштовий сервер.
        }
    }
}