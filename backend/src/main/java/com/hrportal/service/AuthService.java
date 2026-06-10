package com.hrportal.service;

import com.hrportal.dto.DTOs;
import com.hrportal.model.User;
import com.hrportal.repository.UserRepository;
import com.hrportal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    public DTOs.AuthResponse login(DTOs.LoginRequest request) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email, request.password));

        String token = jwtUtil.generateToken(auth);
        User user = userRepository.findByEmail(request.email).orElseThrow();

        return new DTOs.AuthResponse(token, user.getEmail(), user.getFullName(),
                List.copyOf(user.getRoles()));
    }

    public DTOs.AuthResponse register(DTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email)) {
            throw new RuntimeException("Email already registered: " + request.email);
        }

        String role = (request.role != null) ? request.role.toUpperCase() : "RECRUITER";
        if (!Set.of("HR_ADMIN", "RECRUITER", "CANDIDATE").contains(role)) {
            role = "RECRUITER";
        }

        User user = new User();
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        Set<String> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        user.setEnabled(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(request.email);
        return new DTOs.AuthResponse(token, user.getEmail(), user.getFullName(), List.of(role));
    }
}
