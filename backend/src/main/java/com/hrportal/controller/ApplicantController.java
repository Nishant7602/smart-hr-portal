package com.hrportal.controller;

import com.hrportal.dto.DTOs;
import com.hrportal.service.ApplicantService;
import com.hrportal.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applicants")
public class ApplicantController {

    private final ApplicantService applicantService;

    @Autowired
    public ApplicantController(ApplicantService applicantService) {
        this.applicantService = applicantService;
    }

    @PostMapping(value = "/job/{jobId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DTOs.ApiResponse<DTOs.ApplicantResponse>> applyForJob(
            @PathVariable Long jobId,
            @RequestPart("data") @Valid DTOs.ApplicantRequest request,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Application submitted",
                applicantService.createApplicant(jobId, request, resume)));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<Page<DTOs.ApplicantResponse>> getApplicantsByJob(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        return ResponseEntity.ok(applicantService.getApplicantsByJob(jobId,
                PageRequest.of(page, size, Sort.by(dir, sortBy))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.ApplicantResponse>> getApplicant(
            @PathVariable Long id) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok(applicantService.getApplicantById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.ApplicantResponse>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Status updated",
                applicantService.updateStatus(id, status)));
    }

    @PostMapping("/{id}/screen")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.ApplicantResponse>> screenApplicant(
            @PathVariable Long id) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("AI screening complete",
                applicantService.screenApplicant(id)));
    }

    @GetMapping("/job/{jobId}/ranked")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<List<DTOs.RankedCandidateResponse>>> getRankedCandidates(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok(
                applicantService.getRankedCandidates(jobId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<DTOs.ApiResponse<Void>> deleteApplicant(@PathVariable Long id) {
        applicantService.deleteApplicant(id);
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Applicant deleted", null));
    }
}


@RestController
@RequestMapping("/api/interviews")
class InterviewController {

    private final InterviewService interviewService;

    @Autowired
    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.InterviewResponse>> schedule(
            @Valid @RequestBody DTOs.InterviewRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Interview scheduled",
                interviewService.scheduleInterview(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.InterviewResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok(interviewService.getInterviewById(id)));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<List<DTOs.InterviewResponse>> getByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(interviewService.getInterviewsByJob(jobId));
    }

    @GetMapping("/applicant/{applicantId}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<List<DTOs.InterviewResponse>> getByApplicant(@PathVariable Long applicantId) {
        return ResponseEntity.ok(interviewService.getInterviewsByApplicant(applicantId));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<List<DTOs.InterviewResponse>> getUpcoming() {
        return ResponseEntity.ok(interviewService.getUpcomingInterviews());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.InterviewResponse>> update(
            @PathVariable Long id, @RequestBody DTOs.InterviewRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Updated",
                interviewService.updateInterview(id, request)));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.InterviewResponse>> submitFeedback(
            @PathVariable Long id, @Valid @RequestBody DTOs.FeedbackRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Feedback submitted",
                interviewService.submitFeedback(id, request)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<DTOs.InterviewResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Cancelled",
                interviewService.cancelInterview(id)));
    }

    @GetMapping("/{id}/questions")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> generateQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok(
                interviewService.generateInterviewQuestions(id)));
    }
}
