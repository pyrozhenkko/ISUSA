package org.ccpc.isusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "ApplicationType")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TypeID")
    private Integer typeId;

    @Column(name = "TypeName", length = 200, nullable = false, unique = true)
    private String typeName;

    @Column(name = "Description", length = 500)
    private String description;

    @OneToMany(mappedBy = "applicationType", fetch = FetchType.LAZY)
    private Set<Application> applications;
}