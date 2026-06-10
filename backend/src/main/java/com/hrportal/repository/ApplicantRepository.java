package com.hrportal.repository;

import com.hrportal.model.Applicant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {

    List<Applicant> findByJobId(Long jobId);

    Page<Applicant> findByJobId(Long jobId, Pageable pageable);

    Optional<Applicant> findByEmailAndJobId(String email, Long jobId);

    List<Applicant> findByJobIdAndStatus(Long jobId, Applicant.ApplicantStatus status);

    @Query("SELECT a FROM Applicant a WHERE a.job.id = :jobId ORDER BY a.aiScore DESC NULLS LAST")
    List<Applicant> findByJobIdOrderByAiScoreDesc(@Param("jobId") Long jobId);

    @Query("SELECT COUNT(a) FROM Applicant a WHERE a.job.id = :jobId AND a.status = :status")
    Long countByJobIdAndStatus(@Param("jobId") Long jobId,
                               @Param("status") Applicant.ApplicantStatus status);

    @Query("SELECT COUNT(a) FROM Applicant a WHERE a.job.id = :jobId")
    Long countByJobId(@Param("jobId") Long jobId);

    @Query("SELECT a FROM Applicant a WHERE a.job.id = :jobId AND a.aiScore IS NOT NULL ORDER BY a.aiScore DESC")
    List<Applicant> findRankedApplicants(@Param("jobId") Long jobId);

    @Query("SELECT COUNT(a) FROM Applicant a")
    Long countAllApplicants();

    @Query("SELECT a.status, COUNT(a) FROM Applicant a GROUP BY a.status")
    List<Object[]> countByStatus();
}
