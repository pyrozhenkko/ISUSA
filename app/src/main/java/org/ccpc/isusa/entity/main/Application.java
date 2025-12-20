package org.ccpc.isusa.entity.main;

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

    @Lob // Тип TEXT
    @Column(name = "Content", nullable = false)
    private String content;

    @CreationTimestamp
    @Column(name = "CreatedDate", updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "UpdatedDate")
    private LocalDateTime updatedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProcessedByUserID")
    private User processedByUser;

    // === НОВІ ПОЛЯ ДЛЯ ПІДПИСУ ===

    /**
     * "Відбиток" заявки (SHA-256 від контенту),
     * який використовувався для генерації dataHash.
     */
    @Column(name = "ContentHash", length = 64)
    private String contentHash;

    /**
     * Дані, які були підписані (StudentId + ContentHash + Timestamp + Nonce)
     * Зберігаються для майбутньої перевірки.
     */
    @Lob
    @Column(name = "DataToSign")
    private String dataToSign;

    /**
     * Сам асиметричний підпис (RSA) для dataToSign,
     * збережений у форматі Base64.
     */
    @Lob
    @Column(name = "Signature")
    private String signature;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Attachment> attachments;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ApplicationReviewer> reviewers;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ApplicationHistory> history;
}