package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.entity.Application;
import org.ccpc.isusa.entity.ApplicationStatus;
import org.ccpc.isusa.entity.ApplicationType;
import org.ccpc.isusa.entity.User;
import org.ccpc.isusa.mapper.ApplicationMapper;
import org.ccpc.isusa.repository.ApplicationRepository;
import org.ccpc.isusa.repository.ApplicationStatusRepository;
import org.ccpc.isusa.repository.ApplicationTypeRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * "Мозок" для всієї логіки, пов'язаної з Заявками.
 */
@Service
@RequiredArgsConstructor
public class ApplicationService {

    // Репозиторії для доступу до бази
    private final ApplicationRepository applicationRepository;
    private final ApplicationTypeRepository typeRepository;
    private final ApplicationStatusRepository statusRepository;

    // Сервіси
    private final SignatureService signatureService;
    private final AuthenticationManager authenticationManager; // Для перевірки паролю

    // Маппери
    private final ApplicationMapper applicationMapper;

    /**
     * Створює, "Підписує" та Зберігає нову заявку.
     * Це єдиний спосіб створити заявку в системі.
     */
    @Transactional
    public ApplicationResponseDto signAndSubmitApplication(ApplicationSignRequestDto dto, User currentUser) {

        // --- 1. Акт Волевиявлення (Перевірка паролю) ---
        // Ми перевіряємо, що користувач - це справді він,
        // змушуючи його ввести пароль ще раз.
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            currentUser.getUsername(),
                            dto.getPassword() // Пароль з DTO
                    )
            );
        } catch (AuthenticationException e) {
            // Якщо пароль невірний, кидаємо 401 Unauthorized
            throw new SecurityException("Невірний пароль для підтвердження підпису.");
        }

        // --- 2. Пошук Допоміжних Сутностей ---
        ApplicationType type = typeRepository.findById(dto.getTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Тип заявки з ID " + dto.getTypeId() + " не знайдено."));

        // Припускаємо, що "Нова" - це статус за замовчуванням
        ApplicationStatus initialStatus = statusRepository.findByStatusName("Нова")
                .orElseThrow(() -> new RuntimeException("Критична помилка: Статус 'Нова' не знайдено в data.sql"));

        // --- 3. Створення та Збереження (Перший етап) ---
        // Нам потрібно зберегти заявку один раз, щоб отримати її ID
        Application application = applicationMapper.toEntity(dto);
        application.setStudent(currentUser.getStudent());
        application.setApplicationType(type);
        application.setApplicationStatus(initialStatus);

        // Зберігаємо, щоб отримати ID
        Application savedApp = applicationRepository.save(application);

        // --- 4. Криптографічний Підпис (Другий етап) ---

        // 4.1. Хешуємо контент (Твій план, крок 3)
        String contentHash = signatureService.hashData(savedApp.getContent());

        // 4.2. Генеруємо "Відбиток" (Твій план, крок 4: Nonce, Timestamp...)
        String dataToSign = signatureService.generateDataToSign(
                savedApp.getStudent().getStudentId(),
                savedApp.getApplicationId(),
                contentHash
        );

        // 4.3. Підписуємо "Відбиток" Приватним Ключем (Твій план, крок 2)
        String signature = signatureService.sign(dataToSign);

        // 4.4. Встановлюємо "докази" в нашу заявку
        savedApp.setContentHash(contentHash);
        savedApp.setDataToSign(dataToSign);
        savedApp.setSignature(signature);

        // 5. Оновлюємо заявку з даними підпису
        Application fullySignedApp = applicationRepository.save(savedApp);

        // 6. Повертаємо DTO
        return applicationMapper.toResponseDto(fullySignedApp);
    }

    /**
     * Отримує всі заявки, які належать ТІЛЬКИ поточному студенту.
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getMyApplications(User currentUser) {
        List<Application> applications = applicationRepository.findByStudent(currentUser.getStudent());
        return applications.stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Отримує ОДНУ заявку (для студента, який її створив).
     */
    @Transactional(readOnly = true)
    public ApplicationResponseDto getMyApplicationById(Integer applicationId, User currentUser) {
        Application application = applicationRepository.findByApplicationIdAndStudent(applicationId, currentUser.getStudent())
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено або вона вам не належить."));

        return applicationMapper.toResponseDto(application);
    }
}