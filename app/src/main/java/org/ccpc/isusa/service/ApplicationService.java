package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.ApplicationDraftRequestDto;
import org.ccpc.isusa.dto.request.ApplicationReviewerRequestDto;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.request.ApplicationStatusUpdateDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.entity.*;
import org.ccpc.isusa.mapper.ApplicationMapper;
import org.ccpc.isusa.repository.*;
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
    private final StudentRepository studentRepository;

    private final SignatureService signatureService;
    private final AuthenticationManager authenticationManager;
    private final ApplicationMapper applicationMapper;

    // =================================================================================
    //                               ЛОГІКА СТУДЕНТА
    // =================================================================================

    /**
     * 1. Створення нової ЧЕРНЕТКИ (Draft).
     * Не вимагає пароля, не створює підпис.
     */
    @Transactional
    public ApplicationResponseDto createDraft(ApplicationDraftRequestDto dto, User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        ApplicationType type = getTypeOrThrow(dto.getTypeId());

        // Знаходимо статус "Чернетка". (Впевнись, що додав його в data.sql!)
        ApplicationStatus draftStatus = statusRepository.findByStatusName("Чернетка")
                .orElseThrow(() -> new RuntimeException("Статус 'Чернетка' не налаштований в БД"));

        Application app = new Application();
        app.setTitle(dto.getTitle());
        app.setContent(dto.getContent());
        app.setStudent(student);
        app.setApplicationType(type);
        app.setApplicationStatus(draftStatus);

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    /**
     * 2. Редагування ЧЕРНЕТКИ.
     * Дозволено ТІЛЬКИ якщо статус "Чернетка".
     * Це реалізує вимогу "після підпису не можна змінювати".
     */
    @Transactional
    public ApplicationResponseDto updateDraft(Integer appId, ApplicationDraftRequestDto dto, User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        Application app = getApplicationOrThrow(appId, student);

        // ГОЛОВНА ПЕРЕВІРКА: Незмінність
        if (!"Чернетка".equals(app.getApplicationStatus().getStatusName())) {
            throw new IllegalStateException("Редагувати можна тільки чернетки! Ця заява вже подана.");
        }

        ApplicationType type = getTypeOrThrow(dto.getTypeId());

        app.setTitle(dto.getTitle());
        app.setContent(dto.getContent());
        app.setApplicationType(type);
        // Дата оновлення зміниться автоматично завдяки @UpdateTimestamp

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    /**
     * 3. Видалення ЧЕРНЕТКИ.
     * Дозволено ТІЛЬКИ якщо статус "Чернетка".
     */
    @Transactional
    public void deleteDraft(Integer appId, User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        Application app = getApplicationOrThrow(appId, student);

        if (!"Чернетка".equals(app.getApplicationStatus().getStatusName())) {
            throw new IllegalStateException("Ви не можете видалити подану заяву. Зверніться до деканату.");
        }

        applicationRepository.delete(app);
    }

    /**
     * 4. Підпис та відправка ІСНУЮЧОЇ чернетки.
     * Перетворює "Чернетку" на "Нову" заяву з цифровим підписом.
     */
    @Transactional
    public ApplicationResponseDto signExistingDraft(Integer appId, String password, User currentUser) {
        // а) Перевірка пароля (Волевиявлення)
        validatePassword(currentUser.getUsername(), password);

        Student student = getStudentOrThrow(currentUser);
        Application app = getApplicationOrThrow(appId, student);

        if (!"Чернетка".equals(app.getApplicationStatus().getStatusName())) {
            throw new IllegalStateException("Ця заява вже підписана.");
        }

        // б) Зміна статусу на "Нова"
        ApplicationStatus newStatus = statusRepository.findByStatusName("Нова")
                .orElseThrow(() -> new RuntimeException("Статус 'Нова' не знайдено"));
        app.setApplicationStatus(newStatus);

        // в) Генерація криптографічного підпису
        signApplicationData(app, student);

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    /**
     * 5. "Швидкий шлях": Створення та підпис нової заяви ОДРАЗУ.
     */
    @Transactional
    public ApplicationResponseDto createAndSignApplication(ApplicationSignRequestDto dto, User currentUser) {
        validatePassword(currentUser.getUsername(), dto.getPassword());

        Student student = getStudentOrThrow(currentUser);
        ApplicationType type = getTypeOrThrow(dto.getTypeId());
        ApplicationStatus status = statusRepository.findByStatusName("Нова")
                .orElseThrow(() -> new RuntimeException("Статус 'Нова' не знайдено"));

        Application app = applicationMapper.toEntity(dto);
        app.setStudent(student);
        app.setApplicationType(type);
        app.setApplicationStatus(status);

        // Зберігаємо, щоб отримати ID для підпису
        app = applicationRepository.save(app);

        // Підписуємо
        signApplicationData(app, student);

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    // --- Перегляд заяв ---

    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getMyApplications(User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        return applicationRepository.findByStudent(student).stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponseDto getMyApplicationById(Integer id, User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        return applicationMapper.toResponseDto(getApplicationOrThrow(id, student));
    }

    // =================================================================================
    //                               ЛОГІКА ПЕРСОНАЛУ
    // =================================================================================

    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponseDto getApplicationDetailsAsStaff(Integer id) {
        return applicationMapper.toResponseDto(applicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено")));
    }

    @Transactional
    public ApplicationResponseDto updateApplicationStatus(Integer id, ApplicationStatusUpdateDto dto, User user) {
        Application app = applicationRepository.findById(id).orElseThrow();
        ApplicationStatus status = statusRepository.findById(dto.getStatusId()).orElseThrow();

        ApplicationHistory history = new ApplicationHistory();
        history.setApplication(app);
        history.setStatus(status);
        history.setChangedByUser(user);
        history.setChangeTimestamp(LocalDateTime.now());
        historyRepository.save(history);

        app.setApplicationStatus(status);
        app.setProcessedByUser(user);
        app.setUpdatedDate(LocalDateTime.now());

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    // =================================================================================
    //                               ДОПОМІЖНІ МЕТОДИ
    // =================================================================================

    private void validatePassword(String username, String rawPassword) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, rawPassword));
        } catch (AuthenticationException e) {
            throw new SecurityException("Невірний пароль. Підпис не накладено.");
        }
    }

    private void signApplicationData(Application app, Student student) {
        String contentHash = signatureService.hashData(app.getContent());
        String dataToSign = signatureService.generateDataToSign(
                student.getStudentId(),
                app.getApplicationId(),
                contentHash
        );
        String signature = signatureService.sign(dataToSign);

        app.setContentHash(contentHash);
        app.setDataToSign(dataToSign);
        app.setSignature(signature);
    }

    private Student getStudentOrThrow(User user) {
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Ви не є студентом!"));
    }

    private Application getApplicationOrThrow(Integer appId, Student student) {
        return applicationRepository.findByApplicationIdAndStudent(appId, student)
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено або доступ заборонено"));
    }

    private ApplicationType getTypeOrThrow(Integer typeId) {
        return typeRepository.findById(typeId)
                .orElseThrow(() -> new EntityNotFoundException("Тип не знайдено"));
    }
    /**
     * (ВИКЛАДАЧ) Додавання рекомендації до заявки.
     */
    @Transactional
    public ApplicationResponseDto addRecommendation(Integer appId, ApplicationReviewerRequestDto dto, User reviewer) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено"));

        // Створюємо (або оновлюємо) запис про рев'ю
        // Оскільки у нас композитний ключ, логіка трохи складніша, але JPA допоможе

        ApplicationReviewer review = new ApplicationReviewer();
        // Встановлюємо ID (композитний)
        // (Тобі може знадобитися створити ApplicationReviewerId в коді, якщо його немає)
        // review.setId(new ApplicationReviewerId(appId, reviewer.getUserId()));

        review.setApplication(app);
        review.setReviewerUser(reviewer);
        review.setRecommendationText(dto.getRecommendationText());
        review.setIsApproved(dto.getIsApprovedByTeacher());
        review.setReviewedDate(LocalDateTime.now());

        // Додаємо до списку рев'юерів заявки (JPA сам збереже завдяки CascadeType.ALL)
        app.getReviewers().add(review);

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

}