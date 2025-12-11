package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.ApplicationReviewerRequestDto;
import org.ccpc.isusa.dto.response.ApplicationReviewerResponseDto;
import org.ccpc.isusa.entity.ApplicationReviewer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;

@Mapper(componentModel = "spring")
public interface ApplicationReviewerMapper {

    // --- Entity to Response DTO ---
    @Mapping(source = "application.applicationId", target = "applicationId")
    @Mapping(source = "reviewerUser.userId", target = "reviewerUserId")
    @Mapping(source = "reviewerUser.username", target = "reviewerUserName")
    ApplicationReviewerResponseDto toDto(ApplicationReviewer entity);

    Set<ApplicationReviewerResponseDto> toDtoSet(Set<ApplicationReviewer> entities);

    // --- Request DTO to Entity ---
    // Ми ігноруємо поля, які встановимо в сервісі (application, reviewerUser, reviewedDate)
    @Mapping(target = "application", ignore = true)
    @Mapping(target = "reviewerUser", ignore = true)
    @Mapping(target = "reviewedDate", ignore = true)
    @Mapping(source = "isApprovedByTeacher", target = "isApproved") // Мапимо наше перейменоване поле
    ApplicationReviewer toEntity(ApplicationReviewerRequestDto dto);
}