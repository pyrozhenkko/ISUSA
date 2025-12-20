package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.dto.response.ApplicationStatusResponseDto;
import org.ccpc.isusa.dto.response.ApplicationTypeResponseDto;
import org.ccpc.isusa.dto.response.RoleResponseDto;
import org.ccpc.isusa.entity.main.ApplicationStatus;
import org.ccpc.isusa.entity.main.ApplicationType;
import org.ccpc.isusa.entity.main.Role;
import org.ccpc.isusa.mapper.ApplicationStatusMapper;
import org.ccpc.isusa.mapper.ApplicationTypeMapper;
import org.ccpc.isusa.mapper.RoleMapper;
import org.ccpc.isusa.repository.main.ApplicationStatusRepository;
import org.ccpc.isusa.repository.main.ApplicationTypeRepository;
import org.ccpc.isusa.repository.main.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервіс для отримання "довідників" - списків,
 * які рідко змінюються (ролі, статуси, типи).
 * Використовується ReferenceDataController.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Оптимізація, оскільки цей сервіс ТІЛЬКИ ЧИТАЄ дані
public class ReferenceDataService {

    // Репозиторії (доступ до бази)
    private final RoleRepository roleRepository;
    private final ApplicationStatusRepository statusRepository;
    private final ApplicationTypeRepository typeRepository;

    // Маппери (конвертація Entity -> DTO)
    private final RoleMapper roleMapper;
    private final ApplicationStatusMapper statusMapper;
    private final ApplicationTypeMapper typeMapper;

    /**
     * Отримує всі доступні ролі з бази даних.
     * @return Список DTO для ролей
     */
    public List<RoleResponseDto> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        // Конвертуємо список Entity у список DTO
        return roles.stream()
                .map(roleMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Отримує всі доступні статуси заявок.
     * @return Список DTO для статусів
     */
    public List<ApplicationStatusResponseDto> getAllApplicationStatuses() {
        List<ApplicationStatus> statuses = statusRepository.findAll();
        // Конвертуємо список Entity у список DTO
        return statuses.stream()
                .map(statusMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Отримує всі доступні типи заявок.
     * @return Список DTO для типів
     */
    public List<ApplicationTypeResponseDto> getAllApplicationTypes() {
        List<ApplicationType> types = typeRepository.findAll();
        // Конвертуємо список Entity у список DTO
        return types.stream()
                .map(typeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}