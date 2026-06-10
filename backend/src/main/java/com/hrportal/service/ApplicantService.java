package com.hrportal.service;

import com.hrportal.dto.DTOs;
import com.hrportal.exception.ResourceNotFoundException;
import com.hrportal.model.Applicant;
import com.hrportal.model.Job;
import com.hrportal.repository.ApplicantRepository;
import com.hrportal.repository.JobRepository;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicantService {

    private static final Logger log = LoggerFactory.getLogger(ApplicantService.class);

    private final ApplicantRepository applicantRepository;
    private final JobRepository jobRepository;
    private final ClaudeAIService claudeAIService;

    @Value("${file.upload-dir:./uploads/resumes}")
    private String uploadDir;

    @Autowired
    public ApplicantService(ApplicantRepository applicantRepository,
                            JobRepository jobRepository,
                            ClaudeAIService claudeAIService) {
        this.applicantRepository = applicantRepository;
        this.jobRepository = jobRepository;
        this.claudeAIService = claudeAIService;
    }

    public DTOs.ApplicantResponse createApplicant(Long jobId, DTOs.ApplicantRequest request,
                                                   MultipartFile resumeFile) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        applicantRepository.findByEmailAndJobId(request.email, jobId).ifPresent(a -> {
            throw new RuntimeException("You have already applied for this position.");
        });

        Applicant applicant = new Applicant();
        applicant.setFirstName(request.firstName);
        applicant.setLastName(request.lastName);
        applicant.setEmail(request.email);
        applicant.setPhone(request.phone);
        applicant.setLinkedinUrl(request.linkedinUrl);
        applicant.setPortfolioUrl(request.portfolioUrl);
        applicant.setCoverLetter(request.coverLetter);
        applicant.setJob(job);
        applicant.setStatus(Applicant.ApplicantStatus.APPLIED);

        if (resumeFile != null && !resumeFile.isEmpty()) {
            String fileName = saveFile(resumeFile);
            applicant.setResumeFileName(resumeFile.getOriginalFilename());
            applicant.setResumeUrl("/api/files/" + fileName);
            String resumeText = extractTextFromPdf(resumeFile);
            applicant.setExtractedResumeText(resumeText);
        }

        Applicant saved = applicantRepository.save(applicant);

        if (saved.getExtractedResumeText() != null && !saved.getExtractedResumeText().isBlank()) {
            screenApplicantAsync(saved.getId());
        }
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<DTOs.ApplicantResponse> getApplicantsByJob(Long jobId, Pageable pageable) {
        return applicantRepository.findByJobId(jobId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DTOs.ApplicantResponse getApplicantById(Long id) {
        return toResponse(findApplicant(id));
    }

    public DTOs.ApplicantResponse updateStatus(Long id, String status) {
        Applicant applicant = findApplicant(id);
        applicant.setStatus(Applicant.ApplicantStatus.valueOf(status.toUpperCase()));
        return toResponse(applicantRepository.save(applicant));
    }

    public void deleteApplicant(Long id) {
        applicantRepository.deleteById(id);
    }

    public DTOs.ApplicantResponse screenApplicant(Long id) {
        Applicant applicant = findApplicant(id);
        Job job = applicant.getJob();

        if (applicant.getExtractedResumeText() == null || applicant.getExtractedResumeText().isBlank()) {
            throw new RuntimeException("No resume text available for screening.");
        }

        DTOs.AIScreeningResponse result = claudeAIService.screenResume(
                applicant.getExtractedResumeText(),
                job.getTitle(),
                job.getDescription() != null ? job.getDescription() : "",
                job.getRequirements() != null ? job.getRequirements() : "");

        applicant.setAiScore(result.score);
        applicant.setAiScreeningSummary(result.summary);
        applicant.setAiStrengths(result.strengths != null ? String.join("; ", result.strengths) : "");
        applicant.setAiGaps(result.gaps != null ? String.join("; ", result.gaps) : "");

        if (result.score != null) {
            if (result.score >= 75)      applicant.setStatus(Applicant.ApplicantStatus.SHORTLISTED);
            else if (result.score < 30)  applicant.setStatus(Applicant.ApplicantStatus.REJECTED);
            else                         applicant.setStatus(Applicant.ApplicantStatus.SCREENING);
        }
        return toResponse(applicantRepository.save(applicant));
    }

    @Async
    public void screenApplicantAsync(Long applicantId) {
        try {
            screenApplicant(applicantId);
            log.info("Async AI screening completed for applicant {}", applicantId);
        } catch (Exception e) {
            log.error("Async screening failed for applicant {}: {}", applicantId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<DTOs.RankedCandidateResponse> getRankedCandidates(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        List<Applicant> applicants = applicantRepository.findByJobId(jobId);
        if (applicants.isEmpty()) return Collections.emptyList();
        return claudeAIService.rankCandidates(applicants, job.getTitle(),
                job.getDescription() != null ? job.getDescription() : "");
    }

    private String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            String extension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName));
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    private String extractTextFromPdf(MultipartFile file) {
        try {
            // PDFBox 3.x uses Loader.loadPDF() instead of PDDocument.load()
            org.apache.pdfbox.pdmodel.PDDocument document =
                org.apache.pdfbox.Loader.loadPDF(file.getBytes());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            document.close();
            return text.length() > 8000 ? text.substring(0, 8000) : text;
        } catch (IOException e) {
            log.warn("Could not extract PDF text: {}", e.getMessage());
            return "";
        }
    }

    private Applicant findApplicant(Long id) {
        return applicantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found: " + id));
    }

    public DTOs.ApplicantResponse toResponse(Applicant a) {
        DTOs.ApplicantResponse r = new DTOs.ApplicantResponse();
        r.id = a.getId();
        r.firstName = a.getFirstName();
        r.lastName = a.getLastName();
        r.email = a.getEmail();
        r.phone = a.getPhone();
        r.linkedinUrl = a.getLinkedinUrl();
        r.portfolioUrl = a.getPortfolioUrl();
        r.coverLetter = a.getCoverLetter();
        r.resumeUrl = a.getResumeUrl();
        r.resumeFileName = a.getResumeFileName();
        r.status = a.getStatus();
        r.aiScreeningSummary = a.getAiScreeningSummary();
        r.aiStrengths = a.getAiStrengths();
        r.aiGaps = a.getAiGaps();
        r.aiScore = a.getAiScore();
        r.jobId = a.getJob().getId();
        r.jobTitle = a.getJob().getTitle();
        r.appliedAt = a.getAppliedAt();
        return r;
    }
}
