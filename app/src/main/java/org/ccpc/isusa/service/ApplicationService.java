package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.request.ApplicationStatusUpdateDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.entity.*;
import org.ccpc.isusa.mapper.ApplicationMapper;
import org.ccpc.isusa.repository.ApplicationHistoryRepository;
import org.ccpc.isusa.repository.ApplicationRepository;
import org.ccpc.isusa.repository.ApplicationStatusRepository;
import org.ccpc.isusa.repository.ApplicationTypeRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationTypeRepository typeRepository;
    private final ApplicationStatusRepository statusRepository;
    private final ApplicationHistoryRepository historyRepository;

    private final SignatureService signatureService;
    private final AuthenticationManager authenticationManager;
    private final ApplicationMapper applicationMapper;

    /**
     * (СТУДЕНТ) Створення нової заявки з "цифровим підписом".
     * Вимагає повторного введення пароля для підтвердження.
     */
    @Transactional
    public ApplicationResponseDto signAndSubmitApplication(ApplicationSignRequestDto dto, User currentUser) {

        // 1. Перевірка "волевиявлення": чи правильний пароль ввів студент?
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(currentUser.getUsername(), dto.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new SecurityException("Невірний пароль. Підпис не підтверджено.");
        }

        // 2. Знаходимо тип і початковий статус
        ApplicationType type = typeRepository.findById(dto.getTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Тип заявки не знайдено"));

        ApplicationStatus status = statusRepository.findByStatusName("Нова")
                .orElseThrow(() -> new RuntimeException("Статус 'Нова' не знайдено"));

        // 3. Створюємо об'єкт заявки
        Application app = applicationMapper.toEntity(dto);
        app.setStudent(currentUser.getStudent());
        app.setApplicationType(type);
        app.setApplicationStatus(status);

        // 4. Зберігаємо (щоб отримати ID для підпису)
        app = applicationRepository.save(app);

        // 5. Криптографія: Генеруємо підпис (RSA)
        String contentHash = signatureService.hashData(app.getContent());
        String dataToSign = signatureService.generateDataToSign(
                currentUser.getStudent().getStudentId(),
                app.getApplicationId(),
                contentHash
        );
        String signature = signatureService.sign(dataToSign);

        // 6. Зберігаємо криптографічні дані в заявку
        app.setContentHash(contentHash);
        app.setDataToSign(dataToSign);
        app.setSignature(signature);

        // 7. Фінальне збереження
        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getMyApplications(User currentUser) {
        // 1. Знаходимо студента, пов'язаного з цим юзером
        if (currentUser.getStudent() == null) {
            throw new RuntimeException("Поточний користувач не є студентом!");
        }

        // 2. Шукаємо всі заявки цього студента
        List<Application> applications = applicationRepository.findByStudent(currentUser.getStudent());

        // 3. Перетворюємо список Entity у список DTO
        return applications.stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Отримує одну конкретну заявку (для перегляду деталей).
     * Перевіряє, чи дійсно вона належить цьому студенту.
     */
    @Transactional(readOnly = true)
    public ApplicationResponseDto getMyApplicationById(Integer applicationId, User currentUser) {
        Application application = applicationRepository.findByApplicationIdAndStudent(
                applicationId,
                currentUser.getStudent()
        ).orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено або ви не маєте до неї доступу."));

        return applicationMapper.toResponseDto(application);
    }

    /**
     * (ПЕРСОНАЛ) Отримати список ВСІХ заявок.
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * (ПЕРСОНАЛ) Отримати деталі БУДЬ-ЯКОЇ заявки.
     */
    @Transactional(readOnly = true)
    public ApplicationResponseDto getApplicationDetailsAsStaff(Integer id) {
        return applicationMapper.toResponseDto(applicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено")));
    }

    /**
     * (АДМІН/ДЕКАНАТ) Оновити статус заявки (з записом в історію).
     */
    @Transactional
    public ApplicationResponseDto updateApplicationStatus(Integer id, ApplicationStatusUpdateDto dto, User user) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено"));

        ApplicationStatus newStatus = statusRepository.findById(dto.getStatusId())
                .orElseThrow(() -> new EntityNotFoundException("Статус не знайдено"));

        // Логуємо зміну в історії
        ApplicationHistory history = new ApplicationHistory();
        history.setApplication(app);
        history.setStatus(newStatus);
        history.setChangedByUser(user);
        history.setChangeTimestamp(LocalDateTime.now());
        historyRepository.save(history);

        app.setApplicationStatus(newStatus);
        app.setProcessedByUser(user);
        app.setUpdatedDate(LocalDateTime.now());

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }
}