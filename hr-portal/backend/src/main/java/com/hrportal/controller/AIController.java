package com.hrportal.controller;

import com.hrportal.dto.DTOs;
import com.hrportal.model.Applicant;
import com.hrportal.repository.ApplicantRepository;
import com.hrportal.repository.JobRepository;
import com.hrportal.service.ClaudeAIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final ClaudeAIService aiService;
    private final ApplicantRepository applicantRepository;
    private final JobRepository jobRepository;

    @Autowired
    public AIController(ClaudeAIService aiService,
                        ApplicantRepository applicantRepository,
                        JobRepository jobRepository) {
        this.aiService = aiService;
        this.applicantRepository = applicantRepository;
        this.jobRepository = jobRepository;
    }

    // ── TEST KEY — call this first to verify API key works ────────────────
    // GET http://localhost:8080/api/ai/test-key  (must be logged in)
    @GetMapping("/test-key")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> testApiKey() {
        try {
            String result = aiService.chatWithHRBot("Say hello in one sentence.", "Testing API key.");
            return ResponseEntity.ok(DTOs.ApiResponse.ok(
                "✅ Claude API key is working! Response: " + result));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(DTOs.ApiResponse.error(
                "❌ API key error: " + e.getMessage()));
        }
    }


    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> generateOfferLetter(
            @Valid @RequestBody DTOs.OfferLetterRequest req) {
        String result = aiService.generateOfferLetter(
                req.candidateName, req.jobTitle, req.department,
                req.salary, req.startDate, req.companyName);
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Offer letter generated", result));
    }

    @PostMapping("/rejection-email")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> generateRejectionEmail(
            @Valid @RequestBody DTOs.RejectionEmailRequest req) {
        String result = aiService.generateRejectionEmail(
                req.candidateName, req.jobTitle, req.reason, req.encourageReapply);
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Rejection email generated", result));
    }

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> chat(
            @Valid @RequestBody DTOs.ChatRequest req) {
        long totalJobs = jobRepository.count();
        long totalApplicants = applicantRepository.count();
        String context = req.context != null ? req.context :
                String.format("System has %d jobs and %d applicants.", totalJobs, totalApplicants);
        String result = aiService.chatWithHRBot(req.message, context);
        return ResponseEntity.ok(DTOs.ApiResponse.ok(result));
    }

    @PostMapping("/skill-gap")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> skillGapAnalysis(
            @Valid @RequestBody DTOs.SkillGapRequest req) {
        String result = aiService.analyzeSkillGap(req.jobRequirements, req.candidateResumeText);
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Skill gap analysis complete", result));
    }

    @GetMapping("/skill-gap/applicant/{applicantId}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> skillGapByApplicant(
            @PathVariable Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));
        String requirements = applicant.getJob().getRequirements() != null
                ? applicant.getJob().getRequirements() : "No requirements specified";
        String resumeText = applicant.getExtractedResumeText() != null
                ? applicant.getExtractedResumeText() : applicant.getAiScreeningSummary();
        if (resumeText == null || resumeText.isBlank())
            return ResponseEntity.badRequest()
                    .body(DTOs.ApiResponse.error("No resume text available"));
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Skill gap analysis complete",
                aiService.analyzeSkillGap(requirements, resumeText)));
    }

    @PostMapping("/salary-benchmark")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> salaryBenchmark(
            @Valid @RequestBody DTOs.SalaryBenchmarkRequest req) {
        String result = aiService.generateSalaryBenchmark(
                req.jobTitle, req.location, req.experience, req.skills);
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Salary benchmark generated", result));
    }

    @GetMapping("/hiring-report/{jobId}")
    @PreAuthorize("hasAnyRole('HR_ADMIN','RECRUITER')")
    public ResponseEntity<DTOs.ApiResponse<String>> hiringReport(@PathVariable Long jobId) {
        var job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        List<Applicant> applicants = applicantRepository.findByJobId(jobId);
        if (applicants.isEmpty())
            return ResponseEntity.badRequest()
                    .body(DTOs.ApiResponse.error("No applicants found for this job"));
        String result = aiService.generateHiringReport(job.getTitle(), applicants);
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Hiring report generated", result));
    }
}
