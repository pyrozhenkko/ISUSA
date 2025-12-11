package org.ccpc.isusa.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.response.RoleResponseDto;
import org.ccpc.isusa.entity.Role;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T03:44:56+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class RoleMapperImpl implements RoleMapper {

    @Override
    public RoleResponseDto toResponseDto(Role entity) {
        if ( entity == null ) {
            return null;
        }

        RoleResponseDto.RoleResponseDtoBuilder roleResponseDto = RoleResponseDto.builder();

        roleResponseDto.roleId( entity.getRoleId() );
        roleResponseDto.roleName( entity.getRoleName() );

        return roleResponseDto.build();
    }

    @Override
    public List<RoleResponseDto> toResponseDtoList(List<Role> entities) {
        if ( entities == null ) {
            return null;
        }

        List<RoleResponseDto> list = new ArrayList<RoleResponseDto>( entities.size() );
        for ( Role role : entities ) {
            list.add( toResponseDto( role ) );
        }

        return list;
    }
}
