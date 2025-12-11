package org.ccpc.isusa.mapper;

import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.ccpc.isusa.dto.request.CommentRequestDto;
import org.ccpc.isusa.dto.response.CommentResponseDto;
import org.ccpc.isusa.entity.Application;
import org.ccpc.isusa.entity.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-30T03:44:56+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class CommentMapperImpl implements CommentMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public CommentResponseDto toResponseDto(Comment entity) {
        if ( entity == null ) {
            return null;
        }

        CommentResponseDto.CommentResponseDtoBuilder commentResponseDto = CommentResponseDto.builder();

        commentResponseDto.applicationId( entityApplicationApplicationId( entity ) );
        commentResponseDto.author( userMapper.toResponseDto( entity.getUser() ) );
        commentResponseDto.commentId( entity.getCommentId() );
        commentResponseDto.commentText( entity.getCommentText() );
        commentResponseDto.createdDate( entity.getCreatedDate() );

        return commentResponseDto.build();
    }

    @Override
    public Comment toEntity(CommentRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        Comment comment = new Comment();

        comment.setCommentText( dto.getCommentText() );

        return comment;
    }

    @Override
    public Set<CommentResponseDto> toResponseDtoSet(Set<Comment> entities) {
        if ( entities == null ) {
            return null;
        }

        Set<CommentResponseDto> set = new LinkedHashSet<CommentResponseDto>( Math.max( (int) ( entities.size() / .75f ) + 1, 16 ) );
        for ( Comment comment : entities ) {
            set.add( toResponseDto( comment ) );
        }

        return set;
    }

    private Integer entityApplicationApplicationId(Comment comment) {
        if ( comment == null ) {
            return null;
        }
        Application application = comment.getApplication();
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
