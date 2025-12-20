package org.ccpc.isusa.repository.main;

import org.ccpc.isusa.entity.main.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {

    List<Log> findByLevel(String level);

    List<Log> findByUser_UserId(Integer userId);

    @Query("SELECT l FROM Log l ORDER BY l.logDate DESC")
    List<Log> findAllOrderByDateDesc();

    @Query("SELECT l FROM Log l WHERE l.level = :level ORDER BY l.logDate DESC")
    List<Log> findByLevelOrderByDateDesc(@Param("level") String level);
}
