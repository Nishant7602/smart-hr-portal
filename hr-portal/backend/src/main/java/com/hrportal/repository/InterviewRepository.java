package com.hrportal.repository;

import com.hrportal.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicantId(Long applicantId);

    List<Interview> findByInterviewerEmail(String email);

    @Query("SELECT i FROM Interview i WHERE i.scheduledAt BETWEEN :start AND :end")
    List<Interview> findByScheduledAtBetween(@Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT i FROM Interview i WHERE i.applicant.job.id = :jobId")
    List<Interview> findByJobId(@Param("jobId") Long jobId);

    List<Interview> findByStatus(Interview.InterviewStatus status);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.status = 'SCHEDULED' AND i.scheduledAt > :now")
    Long countUpcoming(@Param("now") LocalDateTime now);
}
