package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.main.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // --- З Entity -> в Response DTO ---
    @Mapping(source = "role.roleName", target = "roleName")
    @Mapping(source = "student.studentId", target = "studentId")
    // authorities немає в DTO, тому прибираємо згадку про нього (або залишаємо ignore=true, якщо DTO зміниться)
    // MapStruct розумний: якщо поля немає в target, він його і так ігнорує,
    // але для уникнення попереджень можна залишити.
    // У вашому випадку помилка була в toUserEntity, а не тут.
    UserResponseDto toResponseDto(User entity);


    // --- З Request DTO -> в Entity ---
    // Ігноруємо ВСЕ, що не приходить з форми реєстрації

    // Системні поля
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "isActive", ignore = true)

    // Зв'язки
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "processedApplications", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "changes", ignore = true)
    @Mapping(target = "logs", ignore = true)

    // Soft Delete & Audit (НОВІ ПОЛЯ - ВИПРАВЛЕННЯ)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedDate", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)

    // Security / Brute-force protection (НОВІ ПОЛЯ - ВИПРАВЛЕННЯ)
    @Mapping(target = "failedLoginAttempts", ignore = true)
    @Mapping(target = "accountLockedUntil", ignore = true)
    @Mapping(target = "lastLoginDate", ignore = true)
    @Mapping(target = "passwordChangedDate", ignore = true)

    // UserDetails (метод без сеттера)
    // MapStruct може скаржитися на authorities, якщо сприймає його як властивість
    @Mapping(target = "authorities", ignore = true)
    User toUserEntity(StudentRegistrationRequestDto dto);
}