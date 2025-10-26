package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/social-accounts") // Base path for all endpoints in this controller
public class SocialAccountController {

    @Autowired
    private SocialAccountRepository socialAccountRepository;

    /**
     * Handles GET requests to /api/social-accounts.
     * Fetches all SocialAccount entities from the database.
     *
     * @return A ResponseEntity containing a list of SocialAccounts and an OK status.
     */
    @GetMapping
    public ResponseEntity<List<SocialAccount>> getAllSocialAccounts() {
        // Fetch all accounts from the repository
        List<SocialAccount> accounts = socialAccountRepository.findAll();
        
        // Return the list with a 200 OK status
        return ResponseEntity.ok(accounts);
    }

    // You could add other endpoints here later, like:
    // DELETE /api/social-accounts/{id} to disconnect an account
}