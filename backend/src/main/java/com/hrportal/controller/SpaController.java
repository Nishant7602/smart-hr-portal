package com.hrportal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Catch-all controller for React SPA routes.
 * Any non-API, non-static request returns index.html
 * so React Router can handle client-side routing.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/dashboard",
        "/jobs",
        "/apply/{id}",
        "/candidates",
        "/candidates/{id}",
        "/interviews",
        "/offers",
        "/settings",
        "/profile"
    })
    public String forward() {
        return "forward:/index.html";
    }
}