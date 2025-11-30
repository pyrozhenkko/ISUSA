package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // --- З Entity -> в Response DTO ---
    @Mapping(source = "role.roleName", target = "roleName")
    @Mapping(source = "student.studentId", target = "studentId")
    // ПРИБРАНО: @Mapping(target = "authorities", ignore = true) - це викликало помилку!
    UserResponseDto toResponseDto(User entity);


    // --- З Request DTO -> в Entity ---
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "processedApplications", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "changes", ignore = true)
    @Mapping(target = "logs", ignore = true)
    // ПРИБРАНО: @Mapping(target = "authorities", ignore = true)
    User toUserEntity(StudentRegistrationRequestDto dto);
}