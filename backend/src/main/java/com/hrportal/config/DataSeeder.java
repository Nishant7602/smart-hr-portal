package com.hrportal.config;

import com.hrportal.model.Applicant;
import com.hrportal.model.Job;
import com.hrportal.model.User;
import com.hrportal.repository.ApplicantRepository;
import com.hrportal.repository.JobRepository;
import com.hrportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicantRepository applicantRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataSeeder(UserRepository userRepository, JobRepository jobRepository,
                      ApplicantRepository applicantRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicantRepository = applicantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) return;
        log.info("Seeding demo data...");

        // ── Users ──
        User admin = new User();
        admin.setEmail("admin@hrportal.com");
        admin.setFirstName("Sarah");
        admin.setLastName("Johnson");
        admin.setPassword(passwordEncoder.encode("admin123"));
        Set<String> adminRoles = new HashSet<>();
        adminRoles.add("HR_ADMIN");
        adminRoles.add("RECRUITER");
        admin.setRoles(adminRoles);
        admin.setEnabled(true);
        userRepository.save(admin);

        User recruiter = new User();
        recruiter.setEmail("recruiter@hrportal.com");
        recruiter.setFirstName("Mike");
        recruiter.setLastName("Thompson");
        recruiter.setPassword(passwordEncoder.encode("recruiter123"));
        Set<String> recruiterRoles = new HashSet<>();
        recruiterRoles.add("RECRUITER");
        recruiter.setRoles(recruiterRoles);
        recruiter.setEnabled(true);
        userRepository.save(recruiter);

        // ── Jobs ──
        Job j1 = new Job();
        j1.setTitle("Senior Backend Engineer");
        j1.setDepartment("Engineering");
        j1.setLocation("Bangalore / Remote");
        j1.setEmploymentType("FULL_TIME");
        j1.setDescription("We're looking for a talented Senior Backend Engineer to join our growing team. " +
            "You'll design and implement scalable APIs, mentor junior engineers, and drive technical decisions.");
        j1.setRequirements("5+ years Java/Spring Boot · Microservices · PostgreSQL · AWS · REST APIs · Team leadership");
        j1.setBenefits("Competitive salary · Health insurance · Stock options · Flexible hours · Learning budget");
        j1.setSalaryRange("₹25L – ₹40L");
        j1.setOpenings(2);
        j1.setStatus(Job.JobStatus.OPEN);
        j1.setClosingDate(LocalDate.now().plusDays(30));
        j1.setCreatedBy(admin);
        jobRepository.save(j1);

        Job j2 = new Job();
        j2.setTitle("React Frontend Developer");
        j2.setDepartment("Engineering");
        j2.setLocation("Mumbai");
        j2.setEmploymentType("FULL_TIME");
        j2.setDescription("Join our product team to build beautiful, performant user interfaces for our SaaS platform.");
        j2.setRequirements("3+ years React · TypeScript · TailwindCSS · REST API integration · Testing");
        j2.setBenefits("Remote-first · MacBook Pro · Health cover · 24 days PTO");
        j2.setSalaryRange("₹18L – ₹28L");
        j2.setOpenings(1);
        j2.setStatus(Job.JobStatus.OPEN);
        j2.setClosingDate(LocalDate.now().plusDays(21));
        j2.setCreatedBy(admin);
        jobRepository.save(j2);

        Job j3 = new Job();
        j3.setTitle("Product Manager");
        j3.setDepartment("Product");
        j3.setLocation("Delhi / Hybrid");
        j3.setEmploymentType("FULL_TIME");
        j3.setDescription("Own the product roadmap, work closely with engineering and design to ship impactful features.");
        j3.setRequirements("4+ years PM experience · B2B SaaS · Data-driven · Excellent communication");
        j3.setBenefits("ESOP · Top-tier insurance · Annual offsite · Home office allowance");
        j3.setSalaryRange("₹22L – ₹35L");
        j3.setOpenings(1);
        j3.setStatus(Job.JobStatus.OPEN);
        j3.setClosingDate(LocalDate.now().plusDays(14));
        j3.setCreatedBy(admin);
        jobRepository.save(j3);

        Job j4 = new Job();
        j4.setTitle("DevOps Engineer");
        j4.setDepartment("Infrastructure");
        j4.setLocation("Remote");
        j4.setEmploymentType("FULL_TIME");
        j4.setDescription("Build and maintain our cloud infrastructure, CI/CD pipelines, and observability stack.");
        j4.setRequirements("Kubernetes · Terraform · AWS · Docker · GitHub Actions · 3+ years experience");
        j4.setBenefits("100% remote · High-end laptop · Learning stipend · Flexible hours");
        j4.setSalaryRange("₹20L – ₹32L");
        j4.setOpenings(1);
        j4.setStatus(Job.JobStatus.DRAFT);
        j4.setCreatedBy(admin);
        jobRepository.save(j4);

        // ── Applicants ──
        Applicant a1 = new Applicant();
        a1.setFirstName("Rahul"); a1.setLastName("Sharma");
        a1.setEmail("rahul.sharma@email.com"); a1.setPhone("+91-9876543210");
        a1.setJob(j1); a1.setStatus(Applicant.ApplicantStatus.SHORTLISTED);
        a1.setAiScore(88);
        a1.setAiScreeningSummary("Strong candidate with 6 years of Spring Boot experience. " +
            "Led microservices migration at previous company. Excellent fit for the role.");
        a1.setAiStrengths("Spring Boot expertise; Microservices architecture; PostgreSQL; AWS experience");
        a1.setAiGaps("No Kubernetes experience mentioned");
        a1.setLinkedinUrl("https://linkedin.com/in/rahulsharma");
        applicantRepository.save(a1);

        Applicant a2 = new Applicant();
        a2.setFirstName("Priya"); a2.setLastName("Patel");
        a2.setEmail("priya.patel@email.com"); a2.setPhone("+91-9123456789");
        a2.setJob(j1); a2.setStatus(Applicant.ApplicantStatus.INTERVIEW);
        a2.setAiScore(75);
        a2.setAiScreeningSummary("Solid backend developer with 5 years experience. " +
            "Good Spring Boot skills, some gaps in AWS infrastructure knowledge.");
        a2.setAiStrengths("Java; Spring Boot; REST APIs; SQL databases");
        a2.setAiGaps("Limited cloud (AWS) experience; No microservices mentioned");
        applicantRepository.save(a2);

        Applicant a3 = new Applicant();
        a3.setFirstName("Amit"); a3.setLastName("Kumar");
        a3.setEmail("amit.kumar@email.com"); a3.setPhone("+91-9988776655");
        a3.setJob(j1); a3.setStatus(Applicant.ApplicantStatus.APPLIED);
        a3.setAiScore(52);
        a3.setAiScreeningSummary("Mid-level developer. Has Java skills but limited enterprise experience.");
        a3.setAiStrengths("Java fundamentals; MySQL; Basic REST APIs");
        a3.setAiGaps("Only 2 years experience; No cloud skills; No microservices");
        applicantRepository.save(a3);

        Applicant a4 = new Applicant();
        a4.setFirstName("Sneha"); a4.setLastName("Reddy");
        a4.setEmail("sneha.reddy@email.com"); a4.setPhone("+91-9765432100");
        a4.setJob(j2); a4.setStatus(Applicant.ApplicantStatus.SHORTLISTED);
        a4.setAiScore(91);
        a4.setAiScreeningSummary("Exceptional React developer with TypeScript mastery. Top candidate.");
        a4.setAiStrengths("React 18; TypeScript; TailwindCSS; Component architecture; Testing");
        a4.setAiGaps("Limited backend integration experience");
        applicantRepository.save(a4);

        Applicant a5 = new Applicant();
        a5.setFirstName("Kiran"); a5.setLastName("Menon");
        a5.setEmail("kiran.menon@email.com"); a5.setPhone("+91-9654321098");
        a5.setJob(j2); a5.setStatus(Applicant.ApplicantStatus.SCREENING);
        a5.setAiScore(67);
        a5.setAiScreeningSummary("Competent frontend developer. Good React skills, limited TypeScript.");
        a5.setAiStrengths("React; JavaScript; CSS; Responsive design");
        a5.setAiGaps("No TypeScript; No TailwindCSS; Limited testing experience");
        applicantRepository.save(a5);

        log.info("Demo data seeded: 2 users, 4 jobs, 5 applicants");
        log.info("Login: admin@hrportal.com / admin123");
        log.info("Login: recruiter@hrportal.com / recruiter123");
    }
}
