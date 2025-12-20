package org.ccpc.isusa.repository.reports;

import org.ccpc.isusa.entity.reports.ETLMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ETLMetadataRepository extends JpaRepository<ETLMetadata, String> {
}