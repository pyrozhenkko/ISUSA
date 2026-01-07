package org.ccpc.isusa.entity.main;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
    @NotBlank
    @Size(max = 200)
    private String typeName;

    @Column(name = "Description", length = 500)
    @Size(max = 500)
    private String description;

    @OneToMany(mappedBy = "applicationType", fetch = FetchType.LAZY)
    private Set<Application> applications;
}
