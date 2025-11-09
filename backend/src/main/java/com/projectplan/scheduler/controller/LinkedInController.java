package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.service.LinkedInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/linkedin")
public class LinkedInController {

    @Autowired
    private LinkedInService linkedInService;

    @GetMapping("/callback")
    public String handleCallback(@RequestParam("code") String code, @RequestParam("socialAccountId") Long socialAccountId) {
        linkedInService.connectLinkedInAccount(code, socialAccountId);
        return "LinkedIn account connected successfully!";
    }
}
