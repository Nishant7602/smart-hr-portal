package com.hrportal.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @NotBlank
    @Column(nullable = false)
    private String department;

    private String location;
    private String employmentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    private String salaryRange;
    private Integer openings;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.DRAFT;

    private LocalDate closingDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Applicant> applicants = new ArrayList<>();

    public enum JobStatus {
        DRAFT, OPEN, CLOSED, ON_HOLD
    }

    // ── Constructors ──
    public Job() {}

    // ── Getters ──
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDepartment() { return department; }
    public String getLocation() { return location; }
    public String getEmploymentType() { return employmentType; }
    public String getDescription() { return description; }
    public String getRequirements() { return requirements; }
    public String getBenefits() { return benefits; }
    public String getSalaryRange() { return salaryRange; }
    public Integer getOpenings() { return openings; }
    public JobStatus getStatus() { return status; }
    public LocalDate getClosingDate() { return closingDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public User getCreatedBy() { return createdBy; }
    public List<Applicant> getApplicants() { return applicants; }

    // ── Setters ──
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDepartment(String department) { this.department = department; }
    public void setLocation(String location) { this.location = location; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    public void setDescription(String description) { this.description = description; }
    public void setRequirements(String requirements) { this.requirements = requirements; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public void setOpenings(Integer openings) { this.openings = openings; }
    public void setStatus(JobStatus status) { this.status = status; }
    public void setClosingDate(LocalDate closingDate) { this.closingDate = closingDate; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public void setApplicants(List<Applicant> applicants) { this.applicants = applicants; }
}
