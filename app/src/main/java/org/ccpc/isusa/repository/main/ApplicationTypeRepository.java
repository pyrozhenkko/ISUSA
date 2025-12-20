package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.ApplicationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationTypeRepository extends JpaRepository<ApplicationType, Integer> {

    Optional<ApplicationType> findByTypeName(String typeName);

    boolean existsByTypeName(String typeName);
}
