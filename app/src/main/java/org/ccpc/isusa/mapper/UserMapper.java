package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.main.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // === Entity -> Response DTO ===
    @Mapping(source = "role.roleName", target = "roleName")
    @Mapping(source = "student.studentId", target = "studentId")
    @Mapping(source = "profileImageId.fileName", target = "profileImageFileName")
    UserResponseDto toResponseDto(User entity);


    // === Registration DTO -> Entity ===
    @Mapping(source = "username", target = "username")
    @Mapping(source = "email", target = "email")

    // === Ігноруємо ТІЛЬКИ те, що генерується автоматично або не приходить з фронту ===
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "profileImageId", ignore = true)
    @Mapping(target = "position", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedDate", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    @Mapping(target = "failedLoginAttempts", ignore = true)
    @Mapping(target = "accountLockedUntil", ignore = true)
    @Mapping(target = "lastLoginDate", ignore = true)
    @Mapping(target = "passwordChangedDate", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "processedApplications", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "changes", ignore = true)
    @Mapping(target = "logs", ignore = true)

    // === EnrolledDate ===
    // Залишаємо ignore, ТІЛЬКИ ЯКЩО в User.java є @PrePersist.
    // Якщо немає - прибери ignore і передавай дату з сервісу.
    @Mapping(target = "enrolledDate", ignore = true)

    // Я прибрав ігнор для phoneNumber, щоб він зберігався
    @Mapping(target = "dateOfBirth", ignore = true)

    // department, faculty, firstName, lastName, middleName, phoneNumber
    // замапляться автоматично, бо імена полів збігаються.
    User toUserEntity(StudentRegistrationRequestDto dto);
}