package com.hrportal.service;

import com.hrportal.dto.DTOs;
import com.hrportal.exception.ResourceNotFoundException;
import com.hrportal.model.Job;
import com.hrportal.repository.ApplicantRepository;
import com.hrportal.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;
    private final ApplicantRepository applicantRepository;
    private final ClaudeAIService claudeAIService;

    @Autowired
    public JobService(JobRepository jobRepository,
                      ApplicantRepository applicantRepository,
                      ClaudeAIService claudeAIService) {
        this.jobRepository = jobRepository;
        this.applicantRepository = applicantRepository;
        this.claudeAIService = claudeAIService;
    }

    public DTOs.JobResponse createJob(DTOs.JobRequest request) {
        Job job = new Job();
        job.setTitle(request.title);
        job.setDepartment(request.department);
        job.setLocation(request.location);
        job.setEmploymentType(request.employmentType);
        job.setDescription(request.description);
        job.setRequirements(request.requirements);
        job.setBenefits(request.benefits);
        job.setSalaryRange(request.salaryRange);
        job.setOpenings(request.openings);
        job.setStatus(request.status != null ? request.status : Job.JobStatus.DRAFT);
        job.setClosingDate(request.closingDate);
        return toResponse(jobRepository.save(job));
    }

    @Transactional(readOnly = true)
    public Page<DTOs.JobResponse> getAllJobs(String keyword, String status,
                                              String department, Pageable pageable) {
        Job.JobStatus jobStatus = null;
        if (status != null && !status.isBlank()) {
            try { jobStatus = Job.JobStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        return jobRepository.searchJobs(keyword, jobStatus, department, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DTOs.JobResponse getJobById(Long id) {
        return toResponse(findJob(id));
    }

    public DTOs.JobResponse updateJob(Long id, DTOs.JobRequest request) {
        Job job = findJob(id);
        if (request.title != null)          job.setTitle(request.title);
        if (request.department != null)     job.setDepartment(request.department);
        if (request.location != null)       job.setLocation(request.location);
        if (request.employmentType != null) job.setEmploymentType(request.employmentType);
        if (request.description != null)    job.setDescription(request.description);
        if (request.requirements != null)   job.setRequirements(request.requirements);
        if (request.benefits != null)       job.setBenefits(request.benefits);
        if (request.salaryRange != null)    job.setSalaryRange(request.salaryRange);
        if (request.openings != null)       job.setOpenings(request.openings);
        if (request.status != null)         job.setStatus(request.status);
        if (request.closingDate != null)    job.setClosingDate(request.closingDate);
        return toResponse(jobRepository.save(job));
    }

    public void deleteJob(Long id) {
        Job job = findJob(id);
        job.setStatus(Job.JobStatus.CLOSED);
        jobRepository.save(job);
    }

    @Transactional(readOnly = true)
    public List<String> getAllDepartments() {
        return jobRepository.findAllDepartments();
    }

    public String generateJobDescription(DTOs.JDGenerationRequest request) {
        return claudeAIService.generateJobDescription(request);
    }

    private Job findJob(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
    }

    public DTOs.JobResponse toResponse(Job job) {
        Long count = applicantRepository.countByJobId(job.getId());
        DTOs.JobResponse r = new DTOs.JobResponse();
        r.id = job.getId();
        r.title = job.getTitle();
        r.department = job.getDepartment();
        r.location = job.getLocation();
        r.employmentType = job.getEmploymentType();
        r.description = job.getDescription();
        r.requirements = job.getRequirements();
        r.benefits = job.getBenefits();
        r.salaryRange = job.getSalaryRange();
        r.openings = job.getOpenings();
        r.status = job.getStatus();
        r.closingDate = job.getClosingDate();
        r.createdAt = job.getCreatedAt();
        r.applicantCount = count;
        return r;
    }
}
