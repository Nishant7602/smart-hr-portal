package com.hrportal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applicants")
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @Column(nullable = false)
    private String email;

    private String phone;
    private String linkedinUrl;
    private String portfolioUrl;
    private String resumeFileName;
    private String resumeUrl;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Column(columnDefinition = "TEXT")
    private String aiScreeningSummary;

    @Column(columnDefinition = "TEXT")
    private String aiStrengths;

    @Column(columnDefinition = "TEXT")
    private String aiGaps;

    private Integer aiScore;

    @Column(columnDefinition = "TEXT")
    private String extractedResumeText;

    @Enumerated(EnumType.STRING)
    private ApplicantStatus status = ApplicantStatus.APPLIED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Interview> interviews = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ApplicantStatus {
        APPLIED, SCREENING, SHORTLISTED, INTERVIEW, ASSESSMENT, OFFERED, REJECTED, WITHDRAWN
    }

    // ── Constructors ──
    public Applicant() {}

    // ── Getters ──
    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public String getResumeFileName() { return resumeFileName; }
    public String getResumeUrl() { return resumeUrl; }
    public String getCoverLetter() { return coverLetter; }
    public String getAiScreeningSummary() { return aiScreeningSummary; }
    public String getAiStrengths() { return aiStrengths; }
    public String getAiGaps() { return aiGaps; }
    public Integer getAiScore() { return aiScore; }
    public String getExtractedResumeText() { return extractedResumeText; }
    public ApplicantStatus getStatus() { return status; }
    public Job getJob() { return job; }
    public List<Interview> getInterviews() { return interviews; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ── Setters ──
    public void setId(Long id) { this.id = id; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
    public void setAiScreeningSummary(String aiScreeningSummary) { this.aiScreeningSummary = aiScreeningSummary; }
    public void setAiStrengths(String aiStrengths) { this.aiStrengths = aiStrengths; }
    public void setAiGaps(String aiGaps) { this.aiGaps = aiGaps; }
    public void setAiScore(Integer aiScore) { this.aiScore = aiScore; }
    public void setExtractedResumeText(String extractedResumeText) { this.extractedResumeText = extractedResumeText; }
    public void setStatus(ApplicantStatus status) { this.status = status; }
    public void setJob(Job job) { this.job = job; }
    public void setInterviews(List<Interview> interviews) { this.interviews = interviews; }

    // ── Helper ──
    public String getFullName() { return firstName + " " + lastName; }
}
