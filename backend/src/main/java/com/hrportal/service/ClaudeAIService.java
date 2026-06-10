package com.hrportal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrportal.dto.DTOs;
import com.hrportal.model.Applicant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ClaudeAIService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeAIService.class);

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.url}")
    private String apiUrl;

    @Value("${claude.api.model}")
    private String model;

    @Value("${claude.api.max-tokens}")
    private int maxTokens;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // RestTemplate with proper timeouts for external API calls
    private final RestTemplate restTemplate = createRestTemplate();

    private RestTemplate createRestTemplate() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
            new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000);  // 30 seconds connect timeout
        factory.setReadTimeout(120000);    // 120 seconds read timeout (AI takes time)
        return new RestTemplate(factory);
    }

    // ── 1. Resume Screening ───────────────────────────────────────────────
    public DTOs.AIScreeningResponse screenResume(String resumeText, String jobTitle,
                                                   String jobDescription, String requirements) {
        String prompt = String.format("""
            You are an expert senior HR recruiter with 15+ years of experience.
            Carefully analyze the following resume against the job description.
            
            JOB TITLE: %s
            JOB DESCRIPTION: %s
            REQUIREMENTS: %s
            RESUME: %s
            
            Respond ONLY with a valid JSON object (no markdown, no extra text):
            {
              "score": <integer 0-100>,
              "summary": "<2-3 sentence summary>",
              "strengths": ["<strength1>", "<strength2>"],
              "gaps": ["<gap1>", "<gap2>"],
              "recommendation": "<STRONG_YES | YES | MAYBE | NO | STRONG_NO>"
            }
            """, jobTitle, jobDescription, requirements, resumeText);

        String response = callClaude(prompt);
        return parseScreeningResponse(response);
    }

    // ── 2. Candidate Ranking ─────────────────────────────────────────────
    public List<DTOs.RankedCandidateResponse> rankCandidates(
            List<Applicant> applicants, String jobTitle, String jobDescription) {
        if (applicants.isEmpty()) return Collections.emptyList();

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < applicants.size(); i++) {
            Applicant a = applicants.get(i);
            sb.append(String.format("[%d] ID:%d | Name: %s | Score: %s | Summary: %s\n",
                i + 1, a.getId(), a.getFullName(),
                a.getAiScore() != null ? a.getAiScore() : "N/A",
                a.getAiScreeningSummary() != null ? a.getAiScreeningSummary() : "Not screened"));
        }

        String prompt = String.format("""
            Rank these candidates for: %s
            Job: %s
            Candidates: %s
            
            Respond ONLY with a valid JSON array (no markdown):
            [{"applicantId": <id>, "reasoning": "<1-2 sentence explanation>"}]
            Order from best to worst fit. Include ALL candidates.
            """, jobTitle, jobDescription, sb);

        String response = callClaude(prompt);
        return parseRankingResponse(response, applicants);
    }

    // ── 3. JD Generation ─────────────────────────────────────────────────
    public String generateJobDescription(DTOs.JDGenerationRequest request) {
        String prompt = String.format("""
            Write a compelling, inclusive job description for:
            Title: %s | Department: %s | Location: %s | Type: %s | Salary: %s
            Requirements: %s
            Company Culture: %s
            
            Include: role overview, responsibilities (6-8 bullets), requirements (5-6 bullets),
            nice-to-have (3 bullets), benefits (5 bullets), inclusive closing paragraph.
            Use ## markdown headings.
            """,
            request.title, request.department,
            request.location != null ? request.location : "Remote / Hybrid",
            request.employmentType != null ? request.employmentType : "Full-time",
            request.salaryRange != null ? request.salaryRange : "Competitive",
            request.requirements != null ? request.requirements : "To be discussed",
            request.culture != null ? request.culture : "Collaborative and innovative");

        return callClaude(prompt);
    }

    // ── 4. Interview Questions ───────────────────────────────────────────
    public String generateInterviewQuestions(String jobTitle, String candidateSummary,
                                              String interviewType) {
        String prompt = String.format("""
            Generate tailored interview questions for:
            Position: %s | Interview Type: %s | Candidate: %s
            
            Generate 10 questions:
            - 3 behavioral (STAR format)
            - 3 technical/role-specific
            - 2 situational
            - 1 culture fit
            - 1 question for candidate to ask interviewer
            
            Number each question and add a brief note on what it evaluates.
            """, jobTitle, interviewType, candidateSummary);

        return callClaude(prompt);
    }

    // ── 5. Offer Letter ──────────────────────────────────────────────────
    public String generateOfferLetter(String candidateName, String jobTitle,
                                       String department, String salary,
                                       String startDate, String companyName) {
        String prompt = String.format("""
            Generate a professional, warm offer letter for:
            Candidate: %s | Title: %s | Department: %s | Salary: %s | Start: %s | Company: %s
            
            Include: congratulatory opening, role summary, compensation details,
            start date, documents to bring, 7-day acceptance deadline, professional closing.
            """, candidateName, jobTitle, department, salary, startDate, companyName);

        return callClaude(prompt);
    }

    // ── 6. Rejection Email ───────────────────────────────────────────────
    public String generateRejectionEmail(String candidateName, String jobTitle,
                                          String reason, boolean encourageReapply) {
        String prompt = String.format("""
            Write a compassionate rejection email for:
            Candidate: %s | Role: %s | Internal reason (do NOT mention directly): %s
            Encourage reapply: %s
            
            Be kind, thank them, give 1-2 gentle growth pointers.
            Include subject line. Keep it concise (3-4 paragraphs).
            """, candidateName, jobTitle, reason, encourageReapply ? "Yes" : "No");

        return callClaude(prompt);
    }

    // ── 7. HR Chatbot ────────────────────────────────────────────────────
    public String chatWithHRBot(String userMessage, String systemContext) {
        String prompt = String.format("""
            You are HRBot, a friendly HR assistant for SmartHR Portal.
            Help HR teams with recruitment queries and best practices.
            Context: %s
            Question: %s
            Be concise (under 200 words), helpful, and conversational.
            """, systemContext, userMessage);

        return callClaude(prompt);
    }

    // ── 8. Skill Gap Analysis ────────────────────────────────────────────
    public String analyzeSkillGap(String jobRequirements, String candidateResumeText) {
        String prompt = String.format("""
            Perform a detailed skill gap analysis:
            JOB REQUIREMENTS: %s
            CANDIDATE RESUME/SKILLS: %s
            
            Provide:
            1. MATCHED SKILLS
            2. MISSING CRITICAL SKILLS
            3. TRAINABLE GAPS (learnable in <3 months)
            4. EXPERIENCE GAPS
            5. OVERALL RECOMMENDATION (Hire / Hire with training / Do not hire)
            6. SUGGESTED TRAINING PLAN (3-5 specific resources)
            """, jobRequirements, candidateResumeText);

        return callClaude(prompt);
    }

    // ── 9. Salary Benchmarking ───────────────────────────────────────────
    public String generateSalaryBenchmark(String jobTitle, String location,
                                           String experience, String skills) {
        String prompt = String.format("""
            Salary benchmarking for: %s | Location: %s | Experience: %s | Skills: %s
            
            Provide:
            1. SALARY RANGE (Min/Mid/Max in INR/year)
            2. MARKET POSITIONING
            3. KEY SALARY DRIVERS
            4. COMPETING COMPANIES (3-4 with ranges)
            5. NEGOTIATION TIPS (3 tips for HR)
            6. BENEFITS TO HIGHLIGHT
            
            Base on current Indian IT/tech market (2024-2025).
            """, jobTitle, location, experience, skills);

        return callClaude(prompt);
    }

    // ── 10. Hiring Report ────────────────────────────────────────────────
    public String generateHiringReport(String jobTitle, List<Applicant> applicants) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(applicants.size(), 10); i++) {
            Applicant a = applicants.get(i);
            sb.append(String.format("Candidate %d: %s | Score: %s | Status: %s | Summary: %s\n",
                i + 1, a.getFullName(),
                a.getAiScore() != null ? a.getAiScore() : "N/A",
                a.getStatus(),
                a.getAiScreeningSummary() != null ? a.getAiScreeningSummary() : "Not screened"));
        }

        String prompt = String.format("""
            Generate an executive hiring report for: %s (%d candidates)
            Data: %s
            
            Include:
            1. EXECUTIVE SUMMARY (2-3 sentences)
            2. TALENT POOL QUALITY
            3. TOP 3 RECOMMENDED CANDIDATES
            4. CONCERNS / RED FLAGS
            5. HIRING RECOMMENDATION
            6. SUGGESTED TIMELINE
            """, jobTitle, applicants.size(), sb);

        return callClaude(prompt);
    }

    // ── Core AI Call — routes to Claude or Gemini based on config ────────
    private String callClaude(String prompt) {
        // Auto-detect which provider to use based on key format
        if (apiKey != null && apiKey.startsWith("AIza")) {
            return callGemini(prompt);
        }
        return callClaudeAPI(prompt);
    }

    // ── Gemini API Call (Free tier) ───────────────────────────────────────
    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("PASTE_YOUR_KEY_HERE")) {
            throw new RuntimeException(
                "Gemini API key is not configured. " +
                "Get a free key at: https://aistudio.google.com");
        }

        String geminiUrl = "https://generativelanguage.googleapis.com/v1/models/" +
            "gemini-2.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("maxOutputTokens", 2048);
        generationConfig.put("temperature", 0.7);
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        log.info("Calling Gemini API (free tier)...");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                geminiUrl, HttpMethod.POST, entity, Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                @SuppressWarnings("unchecked")
                Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            log.error("Gemini API error: {} | Body: {}", e.getStatusCode(), body);
            if (e.getStatusCode().value() == 400) {
                throw new RuntimeException("Gemini API key invalid. Get free key at: https://aistudio.google.com");
            }
            throw new RuntimeException("Gemini API error: " + body);
        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage());
            throw new RuntimeException("Gemini AI error: " + e.getMessage());
        }
        return "";
    }

    // ── Claude API Call ───────────────────────────────────────────────────
    private String callClaudeAPI(String prompt) {

        if (apiKey == null || apiKey.isBlank() || apiKey.equals("PASTE_YOUR_KEY_HERE")) {
            throw new RuntimeException(
                "API key not configured. Either:\n" +
                "1. Add Claude key (sk-ant-...) from https://console.anthropic.com\n" +
                "2. Add FREE Gemini key (AIza...) from https://aistudio.google.com");
        }

        if (!apiKey.startsWith("sk-ant-")) {
            throw new RuntimeException(
                "Invalid API key format. Expected 'sk-ant-...' for Claude or 'AIza...' for Gemini.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        log.info("Calling Claude API. Model: {}", model);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                apiUrl, HttpMethod.POST, entity, Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content =
                (List<Map<String, Object>>) response.getBody().get("content");
            if (content != null && !content.isEmpty()) {
                return (String) content.get(0).get("text");
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String status = e.getStatusCode().toString();
            String body = e.getResponseBodyAsString();
            log.error("Claude API HTTP error: {} | Body: {}", status, body);

            if (e.getStatusCode().value() == 401) {
                throw new RuntimeException(
                    "Claude API key invalid or expired (401). " +
                    "Get a new key at https://console.anthropic.com");
            } else if (e.getStatusCode().value() == 429) {
                throw new RuntimeException(
                    "Claude API rate limit exceeded. Please wait and try again.");
            } else if (e.getStatusCode().value() == 400) {
                // Check specifically for low balance
                if (body.contains("credit balance is too low")) {
                    throw new RuntimeException(
                        "Claude API credits exhausted. Options:\n" +
                        "1. Add credits at https://console.anthropic.com/billing\n" +
                        "2. Switch to FREE Gemini: get key at https://aistudio.google.com " +
                        "and paste it as claude.api.key in application.yml");
                }
                throw new RuntimeException("Claude API bad request: " + body);
            }
            throw new RuntimeException("Claude API error " + status + ": " + body);

        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            throw new RuntimeException("AI service error: " + e.getMessage());
        }
        return "";
    }

    // ── Response Parsers ─────────────────────────────────────────────────
    private DTOs.AIScreeningResponse parseScreeningResponse(String jsonText) {
        try {
            String clean = jsonText.trim()
                .replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode node = objectMapper.readTree(clean);

            List<String> strengths = new ArrayList<>();
            List<String> gaps = new ArrayList<>();
            if (node.has("strengths")) node.get("strengths").forEach(s -> strengths.add(s.asText()));
            if (node.has("gaps")) node.get("gaps").forEach(g -> gaps.add(g.asText()));

            return new DTOs.AIScreeningResponse(
                node.has("score") ? node.get("score").asInt() : 50,
                node.has("summary") ? node.get("summary").asText() : "",
                strengths, gaps,
                node.has("recommendation") ? node.get("recommendation").asText() : "MAYBE"
            );
        } catch (Exception e) {
            log.error("Failed to parse screening response: {}", e.getMessage());
            return new DTOs.AIScreeningResponse(0, "AI screening failed. Please review manually.",
                Collections.emptyList(), Collections.emptyList(), "MAYBE");
        }
    }

    private List<DTOs.RankedCandidateResponse> parseRankingResponse(
            String jsonText, List<Applicant> applicants) {
        try {
            String clean = jsonText.trim()
                .replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode array = objectMapper.readTree(clean);

            Map<Long, Applicant> applicantMap = new HashMap<>();
            applicants.forEach(a -> applicantMap.put(a.getId(), a));

            List<DTOs.RankedCandidateResponse> ranked = new ArrayList<>();
            for (JsonNode item : array) {
                Long id = item.has("applicantId") ? item.get("applicantId").asLong() : null;
                if (id != null && applicantMap.containsKey(id)) {
                    Applicant a = applicantMap.get(id);
                    DTOs.RankedCandidateResponse r = new DTOs.RankedCandidateResponse();
                    r.applicantId = id;
                    r.name = a.getFullName();
                    r.email = a.getEmail();
                    r.aiScore = a.getAiScore();
                    r.reasoning = item.has("reasoning") ? item.get("reasoning").asText() : "";
                    r.status = a.getStatus();
                    ranked.add(r);
                }
            }
            return ranked;
        } catch (Exception e) {
            log.error("Failed to parse ranking response: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
