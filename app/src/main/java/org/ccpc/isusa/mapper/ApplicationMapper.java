package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.ApplicationSignRequestDto;
import org.ccpc.isusa.dto.response.ApplicationResponseDto;
import org.ccpc.isusa.entity.main.Application;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

// Збираємо ВСІ необхідні маппери
@Mapper(componentModel = "spring", uses = {
        StudentMapper.class,
        ApplicationTypeMapper.class,
        ApplicationStatusMapper.class,
        UserMapper.class,
        CommentMapper.class,
        AttachmentMapper.class
})
public interface ApplicationMapper {

    @Mapping(source = "student", target = "student")
    @Mapping(source = "applicationType", target = "applicationType")
    @Mapping(source = "applicationStatus", target = "applicationStatus")
    @Mapping(source = "processedByUser", target = "processedByUser")
    @Mapping(source = "comments", target = "comments")
    @Mapping(source = "attachments", target = "attachments")
    @Mapping(source = "dataToSign", target = "dataToSign")
    @Mapping(source = "signature", target = "signature")
    ApplicationResponseDto toResponseDto(Application entity);


    // --- З Request DTO -> в Entity ---
    @Mapping(target = "applicationId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "applicationType", ignore = true)
    @Mapping(target = "applicationStatus", ignore = true)
    @Mapping(target = "processedByUser", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "reviewers", ignore = true)
    @Mapping(target = "history", ignore = true)
    // Ігноруємо нові поля, бо ми їх генеруємо вручну
    @Mapping(target = "contentHash", ignore = true)
    @Mapping(target = "dataToSign", ignore = true)
    @Mapping(target = "signature", ignore = true)
    Application toEntity(ApplicationSignRequestDto dto);
}