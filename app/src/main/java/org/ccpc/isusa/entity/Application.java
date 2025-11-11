package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "Applications")
@Getter
@Setter
@NoArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ApplicationID")
    private Integer applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentID", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TypeID", nullable = false)
    private ApplicationType applicationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StatusID", nullable = false)
    private ApplicationStatus applicationStatus;

    @Column(name = "Title", length = 250, nullable = false)
    private String title;

    @Lob // Для типу TEXT
    @Column(name = "Content", nullable = false)
    private String content;

    @CreationTimestamp // Відповідає DEFAULT NOW()
    @Column(name = "CreatedDate", updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp // Оновлюється при зміні сутності
    @Column(name = "UpdatedDate")
    private LocalDateTime updatedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProcessedByUserID") // Nullable
    private User processedByUser;

    // Зворотні зв'язки з каскадним видаленням
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Attachment> attachments;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ApplicationReviewer> reviewers;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ApplicationHistory> history;
}