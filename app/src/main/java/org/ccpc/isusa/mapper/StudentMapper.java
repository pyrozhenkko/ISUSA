package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    // Мапимо тільки ті поля, що стосуються Student
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "applications", ignore = true)
    Student toStudentEntity(StudentRegistrationRequestDto dto);
}