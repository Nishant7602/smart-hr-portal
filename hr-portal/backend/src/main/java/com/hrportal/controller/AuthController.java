package com.hrportal.controller;

import com.hrportal.dto.DTOs;
import com.hrportal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<DTOs.ApiResponse<DTOs.AuthResponse>> login(
            @Valid @RequestBody DTOs.LoginRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok(authService.login(request)));
    }

    @PostMapping("/register")
    public ResponseEntity<DTOs.ApiResponse<DTOs.AuthResponse>> register(
            @Valid @RequestBody DTOs.RegisterRequest request) {
        return ResponseEntity.ok(DTOs.ApiResponse.ok("Registration successful",
                authService.register(request)));
    }
}
