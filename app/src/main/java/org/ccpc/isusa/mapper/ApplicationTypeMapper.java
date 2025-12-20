package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.response.ApplicationTypeResponseDto;
import org.ccpc.isusa.entity.main.ApplicationType;
import org.mapstruct.Mapper;

import java.util.List;


@Mapper(componentModel = "spring")
public interface ApplicationTypeMapper {
    ApplicationTypeResponseDto toResponseDto(ApplicationType entity);
    List<ApplicationTypeResponseDto> toResponseDtoList(List<ApplicationType> entities);
}