package org.ccpc.isusa.entity.main;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class ApplicationReviewerId implements Serializable {

    @Column(name = "ApplicationID")
    @NotNull
    private Integer applicationId;

    @Column(name = "ReviewerUserID")
    @NotNull
    private Integer reviewerUserId;
}
