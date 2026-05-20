package com.hrportal.service;

import com.hrportal.dto.DTOs;
import com.hrportal.exception.ResourceNotFoundException;
import com.hrportal.model.Applicant;
import com.hrportal.model.Interview;
import com.hrportal.repository.ApplicantRepository;
import com.hrportal.repository.InterviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InterviewService {

    private static final Logger log = LoggerFactory.getLogger(InterviewService.class);

    private final InterviewRepository interviewRepository;
    private final ApplicantRepository applicantRepository;
    private final ClaudeAIService claudeAIService;

    @Autowired
    public InterviewService(InterviewRepository interviewRepository,
                            ApplicantRepository applicantRepository,
                            ClaudeAIService claudeAIService) {
        this.interviewRepository = interviewRepository;
        this.applicantRepository = applicantRepository;
        this.claudeAIService = claudeAIService;
    }

    public DTOs.InterviewResponse scheduleInterview(DTOs.InterviewRequest request) {
        Applicant applicant = applicantRepository.findById(request.applicantId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found: " + request.applicantId));

        Interview interview = new Interview();
        interview.setApplicant(applicant);
        interview.setScheduledAt(request.scheduledAt);
        interview.setDurationMinutes(request.durationMinutes != null ? request.durationMinutes : 60);
        interview.setType(request.type);
        interview.setStatus(Interview.InterviewStatus.SCHEDULED);
        interview.setInterviewerName(request.interviewerName);
        interview.setInterviewerEmail(request.interviewerEmail);
        interview.setMeetingLink(request.meetingLink);
        interview.setLocation(request.location);
        interview.setRound(request.round != null ? request.round : 1);
        interview.setNotes(request.notes);

        applicant.setStatus(Applicant.ApplicantStatus.INTERVIEW);
        applicantRepository.save(applicant);

        return toResponse(interviewRepository.save(interview));
    }

    @Transactional(readOnly = true)
    public List<DTOs.InterviewResponse> getInterviewsByJob(Long jobId) {
        return interviewRepository.findByJobId(jobId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DTOs.InterviewResponse> getInterviewsByApplicant(Long applicantId) {
        return interviewRepository.findByApplicantId(applicantId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DTOs.InterviewResponse getInterviewById(Long id) {
        return toResponse(findInterview(id));
    }

    public DTOs.InterviewResponse updateInterview(Long id, DTOs.InterviewRequest request) {
        Interview interview = findInterview(id);
        if (request.scheduledAt != null)     interview.setScheduledAt(request.scheduledAt);
        if (request.type != null)            interview.setType(request.type);
        if (request.durationMinutes != null) interview.setDurationMinutes(request.durationMinutes);
        if (request.interviewerName != null) interview.setInterviewerName(request.interviewerName);
        if (request.interviewerEmail != null)interview.setInterviewerEmail(request.interviewerEmail);
        if (request.meetingLink != null)     interview.setMeetingLink(request.meetingLink);
        if (request.location != null)        interview.setLocation(request.location);
        if (request.notes != null)           interview.setNotes(request.notes);
        if (request.round != null)           interview.setRound(request.round);
        return toResponse(interviewRepository.save(interview));
    }

    public DTOs.InterviewResponse submitFeedback(Long id, DTOs.FeedbackRequest request) {
        Interview interview = findInterview(id);
        interview.setFeedback(request.feedback);
        interview.setRating(request.rating);
        interview.setRecommendation(request.recommendation);
        interview.setStatus(request.status != null ? request.status : Interview.InterviewStatus.COMPLETED);

        if (request.recommendation != null) {
            Applicant applicant = interview.getApplicant();
            switch (request.recommendation) {
                case "STRONG_YES": case "YES":
                    applicant.setStatus(Applicant.ApplicantStatus.OFFERED); break;
                case "NO": case "STRONG_NO":
                    applicant.setStatus(Applicant.ApplicantStatus.REJECTED); break;
                default: break;
            }
            applicantRepository.save(applicant);
        }
        return toResponse(interviewRepository.save(interview));
    }

    public DTOs.InterviewResponse cancelInterview(Long id) {
        Interview interview = findInterview(id);
        interview.setStatus(Interview.InterviewStatus.CANCELLED);
        return toResponse(interviewRepository.save(interview));
    }

    @Transactional(readOnly = true)
    public List<DTOs.InterviewResponse> getUpcomingInterviews() {
        LocalDateTime now = LocalDateTime.now();
        return interviewRepository.findByScheduledAtBetween(now, now.plusDays(7)).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public String generateInterviewQuestions(Long interviewId) {
        Interview interview = findInterview(interviewId);
        Applicant applicant = interview.getApplicant();
        return claudeAIService.generateInterviewQuestions(
                applicant.getJob().getTitle(),
                applicant.getAiScreeningSummary() != null ? applicant.getAiScreeningSummary() : "",
                interview.getType().name());
    }

    private Interview findInterview(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + id));
    }

    public DTOs.InterviewResponse toResponse(Interview i) {
        DTOs.InterviewResponse r = new DTOs.InterviewResponse();
        r.id = i.getId();
        r.applicantId = i.getApplicant().getId();
        r.applicantName = i.getApplicant().getFullName();
        r.jobTitle = i.getApplicant().getJob().getTitle();
        r.scheduledAt = i.getScheduledAt();
        r.durationMinutes = i.getDurationMinutes();
        r.type = i.getType();
        r.status = i.getStatus();
        r.interviewerName = i.getInterviewerName();
        r.interviewerEmail = i.getInterviewerEmail();
        r.meetingLink = i.getMeetingLink();
        r.location = i.getLocation();
        r.round = i.getRound();
        r.notes = i.getNotes();
        r.feedback = i.getFeedback();
        r.rating = i.getRating();
        r.recommendation = i.getRecommendation();
        return r;
    }
}
