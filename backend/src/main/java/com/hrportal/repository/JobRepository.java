package com.hrportal.repository;

import com.hrportal.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(Job.JobStatus status);

    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.department) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR j.status = :status) " +
           "AND (:department IS NULL OR j.department = :department)")
    Page<Job> searchJobs(@Param("keyword") String keyword,
                         @Param("status") Job.JobStatus status,
                         @Param("department") String department,
                         Pageable pageable);

    List<Job> findByDepartment(String department);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = :status")
    Long countByStatus(@Param("status") Job.JobStatus status);

    @Query("SELECT DISTINCT j.department FROM Job j ORDER BY j.department")
    List<String> findAllDepartments();
}
