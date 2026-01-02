package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "Attachments")
@Getter
@Setter
@NoArgsConstructor
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AttachmentID")
    private Integer attachmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ApplicationID", nullable = true)
    private Application application;

    @Column(name = "FileName", length = 255, nullable = false)
    private String fileName;

    @Column(name = "FilePath", length = 1000, nullable = false)
    private String filePath;

    @CreationTimestamp
    @Column(name = "UploadedDate", updatable = false)
    private LocalDateTime uploadedDate;
}