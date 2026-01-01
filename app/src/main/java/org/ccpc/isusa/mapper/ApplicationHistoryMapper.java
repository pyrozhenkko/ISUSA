package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.response.ApplicationHistoryResponseDto;
import org.ccpc.isusa.entity.main.ApplicationHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ApplicationHistoryMapper {

    @Mapping(source = "application.applicationId", target = "applicationId")
    @Mapping(source = "application.title", target = "applicationTitle")
    @Mapping(source = "status.statusId", target = "statusId")
    @Mapping(source = "status.statusName", target = "statusName")
    @Mapping(source = "changedByUser.userId", target = "changedByUserId")
    @Mapping(source = "changedByUser.firstName", target = "changedByUserFirstName")
    @Mapping(source = "changedByUser.middleName", target = "changedByUserMiddleName")
    @Mapping(source = "changedByUser.lastName", target = "changedByUserLastName")
    @Mapping(source = "changedByUser.role.roleName", target = "changedByRole")
    ApplicationHistoryResponseDto toDto(ApplicationHistory entity);

    List<ApplicationHistoryResponseDto> toDtoList(List<ApplicationHistory> entities);
}