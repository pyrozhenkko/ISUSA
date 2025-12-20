package org.ccpc.isusa.mapper;

import org.ccpc.isusa.dto.request.CommentRequestDto;
import org.ccpc.isusa.dto.response.CommentResponseDto;
import org.ccpc.isusa.entity.main.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;

// === (ВИПРАВЛЕНО: Додаємо 'uses = UserMapper.class') ===
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommentMapper {

    // === (ВИПРАВЛЕНО: Мапимо 'user' (Entity) -> 'author' (DTO)) ===
    @Mapping(source = "application.applicationId", target = "applicationId")
    @Mapping(source = "user", target = "author") // <-- UserMapper спрацює тут
    CommentResponseDto toResponseDto(Comment entity);

    @Mapping(target = "commentId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "application", ignore = true)
    @Mapping(target = "user", ignore = true)
    Comment toEntity(CommentRequestDto dto);

    Set<CommentResponseDto> toResponseDtoSet(Set<Comment> entities);
}