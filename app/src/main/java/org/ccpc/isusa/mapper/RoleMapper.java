package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.response.RoleResponseDto;
import org.ccpc.isusa.entity.main.Role;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponseDto toResponseDto(Role entity);
    List<RoleResponseDto> toResponseDtoList(List<Role> entities);
}