package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // --- (ВИПРАВЛЕНО) ---
    // Ми "сплющуємо" role.roleName -> roleName
    // Ми "сплющуємо" student.studentId -> studentId
    @Mapping(source = "role.roleName", target = "roleName")
    @Mapping(source = "student.studentId", target = "studentId")
    @Mapping(target = "authorities", ignore = true) // Ігноруємо поле з 'UserDetails'
    UserResponseDto toResponseDto(User entity);


    // --- (ВИПРАВЛЕНО для StudentRegistration) ---
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "passwordHash", ignore = true) // Ми хешуємо пароль вручну в AuthService
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "processedApplications", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "changes", ignore = true)
    @Mapping(target = "logs", ignore = true)
    // === (ВИПРАВЛЕННЯ: Додаємо ignore = true для authorities) ===
    @Mapping(target = "authorities", ignore = true)
    // Ми можемо мапити з StudentRegistrationRequestDto, бо він має всі поля User
    User toUserEntity(StudentRegistrationRequestDto dto);
}