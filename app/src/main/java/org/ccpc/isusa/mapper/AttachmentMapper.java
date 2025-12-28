package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.AttachmentRequestDto;
import org.ccpc.isusa.dto.response.AttachmentResponseDto;
import org.ccpc.isusa.entity.main.Attachment;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Set;

@Mapper(componentModel = "spring")
public interface AttachmentMapper {

    @Mapping(source = "application.applicationId", target = "applicationId")
    @Mapping(target = "fileUrl", ignore = true) // Ігноруємо тут, заповнимо в @AfterMapping
    AttachmentResponseDto toResponseDto(Attachment entity);

    @Mapping(target = "attachmentId", ignore = true)
    @Mapping(target = "application", ignore = true)
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    @Mapping(target = "uploadedDate", ignore = true)
    Attachment toEntity(AttachmentRequestDto dto);

    Set<AttachmentResponseDto> toResponseDtoSet(Set<Attachment> entities);

    // === МАГІЯ: Цей метод запускається АВТОМАТИЧНО після кожного маппінгу ===
    @AfterMapping
    default void generateDownloadUrl(Attachment entity, @MappingTarget AttachmentResponseDto dto) {
        if (entity.getAttachmentId() != null) {
            // Генеруємо посилання: http://host:port/api/attachments/download/{id}
            try {
                String downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/attachments/download/")
                        .path(entity.getAttachmentId().toString())
                        .toUriString();
                dto.setFileUrl(downloadUrl);
            } catch (Exception e) {
                // Це може статися, якщо немає активного HTTP-запиту (наприклад, у тестах)
                dto.setFileUrl(null);
            }
        }
    }
}