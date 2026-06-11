package com.hrportal.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/register", 
        "/dashboard",
        "/jobs",
        "/jobs/**",
        "/apply/**",
        "/candidates",
        "/candidates/**",
        "/interviews",
        "/interviews/**",
        "/offers",
        "/offers/**",
        "/profile",
        "/settings"
    })
    public String forward(HttpServletRequest request) {
        return "forward:/index.html";
    }
}