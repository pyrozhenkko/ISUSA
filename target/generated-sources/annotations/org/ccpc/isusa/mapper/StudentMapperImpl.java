package org.ccpc.isusa.mapper;

import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.StudentResponseDto;
import org.ccpc.isusa.entity.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T03:44:56+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class StudentMapperImpl implements StudentMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public StudentResponseDto toResponseDto(Student entity) {
        if ( entity == null ) {
            return null;
        }

        StudentResponseDto.StudentResponseDtoBuilder studentResponseDto = StudentResponseDto.builder();

        studentResponseDto.userResponseDto( userMapper.toResponseDto( entity.getUser() ) );
        studentResponseDto.studentId( entity.getStudentId() );
        studentResponseDto.groupId( entity.getGroupId() );
        studentResponseDto.specialty( entity.getSpecialty() );
        studentResponseDto.faculty( entity.getFaculty() );

        return studentResponseDto.build();
    }

    @Override
    public Student toStudentEntity(StudentRegistrationRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Student student = new Student();

        student.setStudentId( dto.getStudentId() );
        student.setGroupId( dto.getGroupId() );
        student.setSpecialty( dto.getSpecialty() );
        student.setFaculty( dto.getFaculty() );

        return student;
    }
}
