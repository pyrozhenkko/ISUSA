package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    //  user.getRole().getRoleName() -> "roleName"
    @Mapping(source = "role.roleName", target = "roleName")
    @Mapping(source = "student.studentId", target = "studentId")
    UserResponseDto toResponseDto(User entity);

    // Мапимо тільки ті поля, що стосуються User
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
    User toUserEntity(StudentRegistrationRequestDto dto);
}