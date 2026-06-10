package com.hrportal.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewType type;

    @Enumerated(EnumType.STRING)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    private String interviewerName;
    private String interviewerEmail;
    private String meetingLink;
    private String location;
    private Integer round = 1;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Integer rating;
    private String recommendation;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum InterviewType {
        PHONE_SCREEN, VIDEO, IN_PERSON, TECHNICAL, HR, PANEL
    }

    public enum InterviewStatus {
        SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED
    }

    // ── Constructors ──
    public Interview() {}

    // ── Getters ──
    public Long getId() { return id; }
    public Applicant getApplicant() { return applicant; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public InterviewType getType() { return type; }
    public InterviewStatus getStatus() { return status; }
    public String getInterviewerName() { return interviewerName; }
    public String getInterviewerEmail() { return interviewerEmail; }
    public String getMeetingLink() { return meetingLink; }
    public String getLocation() { return location; }
    public Integer getRound() { return round; }
    public String getNotes() { return notes; }
    public String getFeedback() { return feedback; }
    public Integer getRating() { return rating; }
    public String getRecommendation() { return recommendation; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ── Setters ──
    public void setId(Long id) { this.id = id; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public void setType(InterviewType type) { this.type = type; }
    public void setStatus(InterviewStatus status) { this.status = status; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }
    public void setInterviewerEmail(String interviewerEmail) { this.interviewerEmail = interviewerEmail; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public void setLocation(String location) { this.location = location; }
    public void setRound(Integer round) { this.round = round; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}
