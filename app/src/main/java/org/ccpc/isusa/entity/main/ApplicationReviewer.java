package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @NotNull
    private ApplicationReviewerId id = new ApplicationReviewerId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("applicationId")
    @JoinColumn(name = "ApplicationID")
    @NotNull
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("reviewerUserId")
    @JoinColumn(name = "ReviewerUserID")
    @NotNull
    private User reviewerUser;

    @Lob
    @Column(name = "RecommendationText")
    @Size(max = 2000)
    private String recommendationText;

    @Column(name = "IsApproved")
    private Boolean isApproved;

    @Column(name = "ReviewedDate")
    private LocalDateTime reviewedDate;
}
