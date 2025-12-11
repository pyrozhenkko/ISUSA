package org.ccpc.isusa.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.response.ApplicationTypeResponseDto;
import org.ccpc.isusa.entity.ApplicationType;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T03:44:56+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class ApplicationTypeMapperImpl implements ApplicationTypeMapper {

    @Override
    public ApplicationTypeResponseDto toResponseDto(ApplicationType entity) {
        if ( entity == null ) {
            return null;
        }

        ApplicationTypeResponseDto.ApplicationTypeResponseDtoBuilder applicationTypeResponseDto = ApplicationTypeResponseDto.builder();

        applicationTypeResponseDto.typeId( entity.getTypeId() );
        applicationTypeResponseDto.typeName( entity.getTypeName() );
        applicationTypeResponseDto.description( entity.getDescription() );

        return applicationTypeResponseDto.build();
    }

    @Override
    public List<ApplicationTypeResponseDto> toResponseDtoList(List<ApplicationType> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ApplicationTypeResponseDto> list = new ArrayList<ApplicationTypeResponseDto>( entities.size() );
        for ( ApplicationType applicationType : entities ) {
            list.add( toResponseDto( applicationType ) );
        }

        return list;
    }
}
