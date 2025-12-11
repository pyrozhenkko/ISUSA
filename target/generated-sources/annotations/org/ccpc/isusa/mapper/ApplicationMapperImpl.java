package org.ccpc.isusa.mapper;

import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.entity.Application;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T03:44:56+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class ApplicationMapperImpl implements ApplicationMapper {

    @Autowired
    private StudentMapper studentMapper;
    @Autowired
    private ApplicationTypeMapper applicationTypeMapper;
    @Autowired
    private ApplicationStatusMapper applicationStatusMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private CommentMapper commentMapper;
    @Autowired
    private AttachmentMapper attachmentMapper;

    @Override
    public ApplicationResponseDto toResponseDto(Application entity) {
        if ( entity == null ) {
            return null;
        }

        ApplicationResponseDto.ApplicationResponseDtoBuilder applicationResponseDto = ApplicationResponseDto.builder();

        applicationResponseDto.student( studentMapper.toResponseDto( entity.getStudent() ) );
        applicationResponseDto.applicationType( applicationTypeMapper.toResponseDto( entity.getApplicationType() ) );
        applicationResponseDto.applicationStatus( applicationStatusMapper.toResponseDto( entity.getApplicationStatus() ) );
        applicationResponseDto.processedByUser( userMapper.toResponseDto( entity.getProcessedByUser() ) );
        applicationResponseDto.comments( commentMapper.toResponseDtoSet( entity.getComments() ) );
        applicationResponseDto.attachments( attachmentMapper.toResponseDtoSet( entity.getAttachments() ) );
        applicationResponseDto.dataToSign( entity.getDataToSign() );
        applicationResponseDto.signature( entity.getSignature() );
        applicationResponseDto.applicationId( entity.getApplicationId() );
        applicationResponseDto.title( entity.getTitle() );
        applicationResponseDto.content( entity.getContent() );
        applicationResponseDto.createdDate( entity.getCreatedDate() );
        applicationResponseDto.updatedDate( entity.getUpdatedDate() );

        return applicationResponseDto.build();
    }

    @Override
    public Application toEntity(ApplicationSignRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Application application = new Application();

        application.setTitle( dto.getTitle() );
        application.setContent( dto.getContent() );

        return application;
    }
}
