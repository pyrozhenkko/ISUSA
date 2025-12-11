package org.ccpc.isusa.mapper;

import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.request.AttachmentRequestDto;
import org.ccpc.isusa.dto.response.AttachmentResponseDto;
import org.ccpc.isusa.entity.Application;
import org.ccpc.isusa.entity.Attachment;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T03:44:56+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class AttachmentMapperImpl implements AttachmentMapper {

    @Override
    public AttachmentResponseDto toResponseDto(Attachment entity) {
        if ( entity == null ) {
            return null;
        }

        AttachmentResponseDto.AttachmentResponseDtoBuilder attachmentResponseDto = AttachmentResponseDto.builder();

        attachmentResponseDto.applicationId( entityApplicationApplicationId( entity ) );
        attachmentResponseDto.attachmentId( entity.getAttachmentId() );
        attachmentResponseDto.fileName( entity.getFileName() );
        attachmentResponseDto.uploadedDate( entity.getUploadedDate() );

        return attachmentResponseDto.build();
    }

    @Override
    public Attachment toEntity(AttachmentRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Attachment attachment = new Attachment();

        return attachment;
    }

    @Override
    public Set<AttachmentResponseDto> toResponseDtoSet(Set<Attachment> entities) {
        if ( entities == null ) {
            return null;
        }

        Set<AttachmentResponseDto> set = new LinkedHashSet<AttachmentResponseDto>( Math.max( (int) ( entities.size() / .75f ) + 1, 16 ) );
        for ( Attachment attachment : entities ) {
            set.add( toResponseDto( attachment ) );
        }

        return set;
    }

    private Integer entityApplicationApplicationId(Attachment attachment) {
        if ( attachment == null ) {
            return null;
        }
        Application application = attachment.getApplication();
        if ( application == null ) {
            return null;
        }
        Integer applicationId = application.getApplicationId();
        if ( applicationId == null ) {
            return null;
        }
        return applicationId;
    }
}
