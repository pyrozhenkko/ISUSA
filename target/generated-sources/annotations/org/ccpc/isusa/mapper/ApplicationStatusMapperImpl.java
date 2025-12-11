package org.ccpc.isusa.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.response.ApplicationStatusResponseDto;
import org.ccpc.isusa.entity.ApplicationStatus;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T03:44:56+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class ApplicationStatusMapperImpl implements ApplicationStatusMapper {

    @Override
    public ApplicationStatusResponseDto toResponseDto(ApplicationStatus entity) {
        if ( entity == null ) {
            return null;
        }

        ApplicationStatusResponseDto.ApplicationStatusResponseDtoBuilder applicationStatusResponseDto = ApplicationStatusResponseDto.builder();

        applicationStatusResponseDto.statusId( entity.getStatusId() );
        applicationStatusResponseDto.statusName( entity.getStatusName() );

        return applicationStatusResponseDto.build();
    }

    @Override
    public List<ApplicationStatusResponseDto> toResponseDtoList(List<ApplicationStatus> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ApplicationStatusResponseDto> list = new ArrayList<ApplicationStatusResponseDto>( entities.size() );
        for ( ApplicationStatus applicationStatus : entities ) {
            list.add( toResponseDto( applicationStatus ) );
        }

        return list;
    }
}
