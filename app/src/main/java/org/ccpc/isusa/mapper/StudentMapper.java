package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.StudentResponseDto;
import org.ccpc.isusa.entity.main.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface StudentMapper {

    @Mapping(source = "user", target = "userResponseDto")
    // ===== Entity -> Response DTO =====
    StudentResponseDto toResponseDto(Student entity);

    // ===== Request DTO -> Entity =====
    @Mapping(source = "studentId", target = "studentId")
    @Mapping(source = "groupId", target = "groupId")

    // службові / відсутні в DTO
    @Mapping(target = "yearOfStudy", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "applications", ignore = true)
    Student toStudentEntity(StudentRegistrationRequestDto dto);
}

