package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.response.ApplicationStatusResponseDto;
import org.ccpc.isusa.entity.main.ApplicationStatus;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ApplicationStatusMapper {
    ApplicationStatusResponseDto toResponseDto(ApplicationStatus entity);
    List<ApplicationStatusResponseDto> toResponseDtoList(List<ApplicationStatus> entities);
}