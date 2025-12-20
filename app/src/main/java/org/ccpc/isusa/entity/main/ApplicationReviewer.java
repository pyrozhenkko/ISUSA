package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "ApplicationReviewers")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationReviewer {

    @EmbeddedId
    private ApplicationReviewerId id = new ApplicationReviewerId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("applicationId") // Пов'язує з полем applicationId в EmbeddedId
    @JoinColumn(name = "ApplicationID")
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("reviewerUserId") // Пов'язує з полем reviewerUserId в EmbeddedId
    @JoinColumn(name = "ReviewerUserID")
    private User reviewerUser;

    @Lob
    @Column(name = "RecommendationText")
    private String recommendationText;

    @Column(name = "IsApproved")
    private Boolean isApproved;

    @Column(name = "ReviewedDate")
    private LocalDateTime reviewedDate;
}