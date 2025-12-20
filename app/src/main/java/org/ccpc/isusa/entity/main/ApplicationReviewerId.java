package org.ccpc.isusa.entity.main;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode // Важливо для композитних ключів
public class ApplicationReviewerId implements Serializable {

    @Column(name = "ApplicationID")
    private Integer applicationId;

    @Column(name = "ReviewerUserID")
    private Integer reviewerUserId;
}