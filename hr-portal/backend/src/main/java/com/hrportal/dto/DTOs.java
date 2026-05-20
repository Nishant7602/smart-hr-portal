package com.hrportal.dto;

import com.hrportal.model.Applicant;
import com.hrportal.model.Interview;
import com.hrportal.model.Job;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class DTOs {

    // ===== AUTH =====
    public static class LoginRequest {
        @Email @NotBlank public String email;
        @NotBlank public String password;
        public LoginRequest() {}
    }

    public static class RegisterRequest {
        @NotBlank public String firstName;
        @NotBlank public String lastName;
        @Email @NotBlank public String email;
        @NotBlank public String password;
        public String role;
        public RegisterRequest() {}
    }

    public static class AuthResponse {
        public String token;
        public String email;
        public String fullName;
        public List<String> roles;
        public AuthResponse() {}
        public AuthResponse(String token, String email, String fullName, List<String> roles) {
            this.token = token; this.email = email;
            this.fullName = fullName; this.roles = roles;
        }
    }

    // ===== JOB =====
    public static class JobRequest {
        @NotBlank public String title;
        @NotBlank public String department;
        public String location;
        public String employmentType;
        public String description;
        public String requirements;
        public String benefits;
        public String salaryRange;
        public Integer openings;
        public Job.JobStatus status;
        public LocalDate closingDate;
        public JobRequest() {}
    }

    public static class JobResponse {
        public Long id;
        public String title;
        public String department;
        public String location;
        public String employmentType;
        public String description;
        public String requirements;
        public String benefits;
        public String salaryRange;
        public Integer openings;
        public Job.JobStatus status;
        public LocalDate closingDate;
        public LocalDateTime createdAt;
        public Long applicantCount;
        public JobResponse() {}
    }

    // ===== APPLICANT =====
    public static class ApplicantRequest {
        @NotBlank public String firstName;
        @NotBlank public String lastName;
        @Email @NotBlank public String email;
        public String phone;
        public String linkedinUrl;
        public String portfolioUrl;
        public String coverLetter;
        public ApplicantRequest() {}
    }

    public static class ApplicantResponse {
        public Long id;
        public String firstName;
        public String lastName;
        public String email;
        public String phone;
        public String linkedinUrl;
        public String portfolioUrl;
        public String coverLetter;
        public String resumeUrl;
        public String resumeFileName;
        public Applicant.ApplicantStatus status;
        public String aiScreeningSummary;
        public String aiStrengths;
        public String aiGaps;
        public Integer aiScore;
        public Long jobId;
        public String jobTitle;
        public LocalDateTime appliedAt;
        public ApplicantResponse() {}
    }

    // ===== INTERVIEW =====
    public static class InterviewRequest {
        @NotNull public Long applicantId;
        @NotNull public LocalDateTime scheduledAt;
        public Integer durationMinutes;
        @NotNull public Interview.InterviewType type;
        public String interviewerName;
        public String interviewerEmail;
        public String meetingLink;
        public String location;
        public Integer round;
        public String notes;
        public InterviewRequest() {}
    }

    public static class InterviewResponse {
        public Long id;
        public Long applicantId;
        public String applicantName;
        public String jobTitle;
        public LocalDateTime scheduledAt;
        public Integer durationMinutes;
        public Interview.InterviewType type;
        public Interview.InterviewStatus status;
        public String interviewerName;
        public String interviewerEmail;
        public String meetingLink;
        public String location;
        public Integer round;
        public String notes;
        public String feedback;
        public Integer rating;
        public String recommendation;
        public InterviewResponse() {}
    }

    public static class FeedbackRequest {
        @NotBlank public String feedback;
        public Integer rating;
        public String recommendation;
        public Interview.InterviewStatus status;
        public FeedbackRequest() {}
    }

    // ===== AI =====
    public static class JDGenerationRequest {
        @NotBlank public String title;
        @NotBlank public String department;
        public String location;
        public String requirements;
        public String culture;
        public String salaryRange;
        public String employmentType;
        public JDGenerationRequest() {}
    }

    public static class AIScreeningResponse {
        public Integer score;
        public String summary;
        public List<String> strengths;
        public List<String> gaps;
        public String recommendation;
        public AIScreeningResponse() {}
        public AIScreeningResponse(Integer score, String summary, List<String> strengths,
                                    List<String> gaps, String recommendation) {
            this.score = score; this.summary = summary; this.strengths = strengths;
            this.gaps = gaps; this.recommendation = recommendation;
        }
    }

    public static class RankedCandidateResponse {
        public Long applicantId;
        public String name;
        public String email;
        public Integer aiScore;
        public String reasoning;
        public Applicant.ApplicantStatus status;
        public RankedCandidateResponse() {}
    }

    public static class DashboardStats {
        public Long totalJobs;
        public Long openJobs;
        public Long totalApplicants;
        public Long upcomingInterviews;
        public Long shortlistedCandidates;
        public Double avgAiScore;
        public DashboardStats() {}
    }

    // ===== NEW AI =====
    public static class OfferLetterRequest {
        @NotBlank public String candidateName;
        @NotBlank public String jobTitle;
        public String department;
        public String salary;
        public String startDate;
        @NotBlank public String companyName;
        public OfferLetterRequest() {}
    }

    public static class RejectionEmailRequest {
        @NotBlank public String candidateName;
        @NotBlank public String jobTitle;
        public String reason;
        public boolean encourageReapply;
        public RejectionEmailRequest() {}
    }

    public static class ChatRequest {
        @NotBlank public String message;
        public String context;
        public ChatRequest() {}
    }

    public static class SkillGapRequest {
        @NotBlank public String jobRequirements;
        @NotBlank public String candidateResumeText;
        public SkillGapRequest() {}
    }

    public static class SalaryBenchmarkRequest {
        @NotBlank public String jobTitle;
        public String location;
        public String experience;
        public String skills;
        public SalaryBenchmarkRequest() {}
    }

    // ===== GENERIC API RESPONSE =====
    public static class ApiResponse<T> {
        public boolean success;
        public String message;
        public T data;

        public ApiResponse() {}
        public ApiResponse(boolean success, String message, T data) {
            this.success = success; this.message = message; this.data = data;
        }

        public static <T> ApiResponse<T> ok(T data) {
            return new ApiResponse<>(true, null, data);
        }
        public static <T> ApiResponse<T> ok(String message, T data) {
            return new ApiResponse<>(true, message, data);
        }
        public static <T> ApiResponse<T> error(String message) {
            return new ApiResponse<>(false, message, null);
        }
    }
}
