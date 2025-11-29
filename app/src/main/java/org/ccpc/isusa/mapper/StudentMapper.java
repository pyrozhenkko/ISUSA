package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.StudentResponseDto;
import org.ccpc.isusa.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

// === (ВИПРАВЛЕНО: Додаємо 'uses = UserMapper.class') ===
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface StudentMapper {

    // === (ВИПРАВЛЕНО: Мапимо 'user' (Entity) -> 'userResponseDto' (DTO)) ===
    // MapStruct автоматично викличе UserMapper для цього поля
    @Mapping(source = "user", target = "userResponseDto")
    StudentResponseDto toResponseDto(Student entity);

    // Маппер для DTO -> Entity (використовується в AuthService)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "applications", ignore = true)
    Student toStudentEntity(StudentRegistrationRequestDto dto);
}