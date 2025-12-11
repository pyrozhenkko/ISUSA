package org.ccpc.isusa.mapper;

import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.request.StudentRegistrationRequestDto;
import org.ccpc.isusa.dto.response.UserResponseDto;
import org.ccpc.isusa.entity.Role;
import org.ccpc.isusa.entity.Student;
import org.ccpc.isusa.entity.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T05:51:51+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponseDto toResponseDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserResponseDto.UserResponseDtoBuilder userResponseDto = UserResponseDto.builder();

        userResponseDto.roleName( entityRoleRoleName( entity ) );
        userResponseDto.studentId( entityStudentStudentId( entity ) );
        userResponseDto.userId( entity.getUserId() );
        userResponseDto.username( entity.getUsername() );
        userResponseDto.fullName( entity.getFullName() );
        userResponseDto.email( entity.getEmail() );
        userResponseDto.authorities( entity.getAuthorities() );

        return userResponseDto.build();
    }

    @Override
    public User toUserEntity(StudentRegistrationRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        User user = new User();

        user.setUsername( dto.getUsername() );
        user.setFullName( dto.getFullName() );
        user.setEmail( dto.getEmail() );

        return user;
    }

    private String entityRoleRoleName(User user) {
        if ( user == null ) {
            return null;
        }
        Role role = user.getRole();
        if ( role == null ) {
            return null;
        }
        String roleName = role.getRoleName();
        if ( roleName == null ) {
            return null;
        }
        return roleName;
    }

    private Integer entityStudentStudentId(User user) {
        if ( user == null ) {
            return null;
        }
        Student student = user.getStudent();
        if ( student == null ) {
            return null;
        }
        Integer studentId = student.getStudentId();
        if ( studentId == null ) {
            return null;
        }
        return studentId;
    }
}
