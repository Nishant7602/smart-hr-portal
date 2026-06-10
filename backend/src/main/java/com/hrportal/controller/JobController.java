package com.hrportal.controller;

import com.hrportal.dto.DTOs;
import com.hrportal.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    @Autowired
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<Page<DTOs.JobResponse>> getAllJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return ResponseEntity.ok(jobService.getAllJobs(keyword, status, department, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DTOs.ApiResponse<DTOs.JobResponse>> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok(jobService.getJobById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.JobResponse>> createJob(
            @Valid @RequestBody DTOs.JobRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Job created", jobService.createJob(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.JobResponse>> updateJob(
            @PathVariable Long id, @RequestBody DTOs.JobRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Job updated", jobService.updateJob(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<DTOs.ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Job closed", null));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(jobService.getAllDepartments());
    }

    @PostMapping("/generate-jd")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> generateJD(
            @Valid @RequestBody DTOs.JDGenerationRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("JD generated",
                jobService.generateJobDescription(request)));
    }
}
