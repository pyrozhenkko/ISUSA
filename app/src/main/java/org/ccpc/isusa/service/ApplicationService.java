package org.ccpc.isusa.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
    private final StudentRepository studentRepository; // Важливо для getMyApplications

    private final SignatureService signatureService;
    private final AuthenticationManager authenticationManager;
    private final ApplicationMapper applicationMapper;

    @Transactional
    public ApplicationResponseDto signAndSubmitApplication(ApplicationSignRequestDto dto, User currentUser) {
        // 1. Підтвердження паролем
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(currentUser.getUsername(), dto.getPassword()));
        } catch (AuthenticationException e) {
            throw new SecurityException("Невірний пароль.");
        }

        // 2. Знайти студента
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Студент не знайдений для цього користувача"));

        // 3. Тип і Статус
        ApplicationType type = typeRepository.findById(dto.getTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Тип не знайдено"));
        ApplicationStatus status = statusRepository.findByStatusName("Нова")
                .orElseThrow(() -> new RuntimeException("Статус 'Нова' не знайдено"));

        // 4. Створення
        Application app = applicationMapper.toEntity(dto);
        app.setStudent(student);
        app.setApplicationType(type);
        app.setApplicationStatus(status);
        app = applicationRepository.save(app);

        // 5. Підпис
        String contentHash = signatureService.hashData(app.getContent());
        String dataToSign = signatureService.generateDataToSign(student.getStudentId(), app.getApplicationId(), contentHash);
        String signature = signatureService.sign(dataToSign);

        app.setContentHash(contentHash);
        app.setDataToSign(dataToSign);
        app.setSignature(signature);

        return applicationMapper.toResponseDto(applicationRepository.save(app));
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getMyApplications(User currentUser) {
        // Знаходимо студента через репозиторій (безпечніше, ніж getStudent() з контексту)
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Ви не є студентом!"));

        return applicationRepository.findByStudent(student).stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponseDto getMyApplicationById(Integer id, User currentUser) {
        Student student = studentRepository.findByUser(currentUser)
                .orElseThrow(() -> new RuntimeException("Ви не є студентом!"));

        Application app = applicationRepository.findByApplicationIdAndStudent(id, student)
                .orElseThrow(() -> new EntityNotFoundException("Заявку не знайдено"));

        return applicationMapper.toResponseDto(app);
    }

    // --- Для персоналу ---
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(applicationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponseDto getApplicationDetailsAsStaff(Integer id) {
        return applicationMapper.toResponseDto(applicationRepository.findById(id).orElseThrow());
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
}