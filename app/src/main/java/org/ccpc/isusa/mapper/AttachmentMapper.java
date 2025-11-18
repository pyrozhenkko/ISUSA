package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.AttachmentRequestDto;
import org.ccpc.isusa.dto.response.AttachmentResponseDto;
import org.ccpc.isusa.entity.Attachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;

@Mapper(componentModel = "spring")
public interface AttachmentMapper {

    // === (ВИПРАВЛЕНО: 'fileUrl' тепер існує в DTO) ===
    @Mapping(source = "application.applicationId", target = "applicationId")
    @Mapping(target = "fileUrl", ignore = true) // 'fileUrl' буде згенеровано в сервісі
    AttachmentResponseDto toResponseDto(Attachment entity);

    @Mapping(target = "attachmentId", ignore = true)
    @Mapping(target = "application", ignore = true)
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    @Mapping(target = "uploadedDate", ignore = true)
    Attachment toEntity(AttachmentRequestDto dto);

    Set<AttachmentResponseDto> toResponseDtoSet(Set<Attachment> entities);
}