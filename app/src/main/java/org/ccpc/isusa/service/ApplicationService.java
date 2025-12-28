package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.request.ApplicationDraftRequestDto;
import org.ccpc.isusa.dto.request.ApplicationReviewerRequestDto;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.request.ApplicationStatusUpdateDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.dto.response.ApplicationTypeResponseDto;
import org.ccpc.isusa.entity.main.*;
import org.ccpc.isusa.mapper.ApplicationMapper;
import org.ccpc.isusa.mapper.ApplicationTypeMapper;
import org.ccpc.isusa.repository.main.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final ApplicationTypeMapper applicationTypeMapper;

    // ДОДАНО: Сервіс для роботи з файлами (необхідний для signAndSubmitWithPhoto)
    private final AttachmentService attachmentService;

    // =================================================================================
    //                               ЛОГІКА СТУДЕНТА
    // =================================================================================

    @Transactional(readOnly = true)
    public List<ApplicationTypeResponseDto> getAllApplicationTypes() {
        return typeRepository.findAll().stream()
                .map(applicationTypeMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Створення та підписання нової заявки РАЗОМ із завантаженням фото.
     * (Це той метод, який ви видалили)
     */
    @Transactional
    public ApplicationResponseDto signAndSubmitWithPhoto(
            ApplicationSignRequestDto dto,
            MultipartFile file,
            User currentUser
    ) throws IOException {

        // 1. Створюємо та підписуємо заявку (використовуємо існуючу логіку)
        ApplicationResponseDto savedAppDto = signAndSubmitApplication(dto, currentUser);

        // 2. Якщо є файл - додаємо його
        if (file != null && !file.isEmpty()) {
            attachmentService.addAttachment(savedAppDto.getApplicationId(), file, currentUser);

            // Оновлюємо DTO, щоб він включав нове вкладення
            return getMyApplicationById(savedAppDto.getApplicationId(), currentUser);
        }

        return savedAppDto;
    }
    


    /**
     * Створення та підписання нової заявки (без фото).
     */
    @Transactional
    public ApplicationResponseDto signAndSubmitApplication(ApplicationSignRequestDto dto, User currentUser) {
        validatePassword(currentUser.getUsername(), dto.getPassword());

        Student student = getStudentOrThrow(currentUser);
        ApplicationType type = getTypeOrThrow(dto.getTypeId());
        ApplicationStatus status = getStatusOrThrow("Нова");

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

    /**
     * 1. Створення нової ЧЕРНЕТКИ (Draft).
     */
    @Transactional
    public ApplicationResponseDto createDraft(ApplicationDraftRequestDto dto, User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        ApplicationType type = getTypeOrThrow(dto.getTypeId());
        ApplicationStatus draftStatus = getStatusOrThrow("Чернетка");

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
     */
    @Transactional
    public ApplicationResponseDto updateDraft(Integer appId, ApplicationDraftRequestDto dto, User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        Application app = getApplicationOrThrow(appId, student);

        if (!"Чернетка".equals(app.getApplicationStatus().getStatusName())) {
            throw new IllegalStateException("Редагувати можна тільки чернетки! Ця заява вже подана.");
        }

        ApplicationType type = getTypeOrThrow(dto.getTypeId());

        app.setTitle(dto.getTitle());
        app.setContent(dto.getContent());
        app.setApplicationType(type);

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    /**
     * 3. Видалення ЧЕРНЕТКИ.
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
     */
    @Transactional
    public ApplicationResponseDto signExistingDraft(Integer appId, String password, User currentUser) {
        validatePassword(currentUser.getUsername(), password);

        Student student = getStudentOrThrow(currentUser);
        Application app = getApplicationOrThrow(appId, student);

        if (!"Чернетка".equals(app.getApplicationStatus().getStatusName())) {
            throw new IllegalStateException("Ця заява вже підписана.");
        }

        ApplicationStatus newStatus = getStatusOrThrow("Нова");
        app.setApplicationStatus(newStatus);

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
    public List<ApplicationResponseDto> getMyDrafts(User currentUser) {
        Student student = getStudentOrThrow(currentUser);
        return applicationRepository.findByStudent(student).stream()
                .filter(a -> "Чернетка".equals(a.getApplicationStatus().getStatusName()))
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
        Application app = applicationRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Заявка не знайдена"));
        ApplicationStatus status = statusRepository.findById(dto.getStatusId()).orElseThrow(() -> new EntityNotFoundException("Статус не знайдено"));

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

    /**
     * (ВИКЛАДАЧ) Додавання рекомендації до заявки.
     */
    @Transactional
    public ApplicationResponseDto addRecommendation(Integer appId, ApplicationReviewerRequestDto dto, User reviewer) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено"));

        ApplicationReviewer review = new ApplicationReviewer();
        review.setApplication(app);
        review.setReviewerUser(reviewer);
        review.setRecommendationText(dto.getRecommendationText());
        review.setIsApproved(dto.getIsApprovedByTeacher());
        review.setReviewedDate(LocalDateTime.now());

        app.getReviewers().add(review);

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    // =================================================================================
    //                               ДОПОМІЖНІ МЕТОДИ
    // =================================================================================

    private void validatePassword(String username, String rawPassword) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, rawPassword));
        } catch (AuthenticationException e) {
            throw new SecurityException("Невірний пароль.");
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

    private ApplicationStatus getStatusOrThrow(String statusName) {
        return statusRepository.findByStatusName(statusName)
                .orElseThrow(() -> new RuntimeException("Статус '" + statusName + "' не знайдено"));
    }
}