package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.dto.CreateChannelRequest;
import com.projectplan.scheduler.dto.UpdateChannelRequest;
import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.model.SocialAccountStatus;
import com.projectplan.scheduler.repository.PostRepository;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social-accounts") // Base path for all endpoints in this controller
public class SocialAccountController {

    @Autowired
    private SocialAccountRepository socialAccountRepository;

    @Autowired
    private PostRepository postRepository;

    /**
     * Handles GET requests to /api/social-accounts.
     * Fetches all SocialAccount entities from the database.
     *
     * @return A ResponseEntity containing a list of SocialAccounts and an OK status.
     */
    @GetMapping
    public ResponseEntity<List<SocialAccount>> getAllSocialAccounts(@RequestParam(required = false) String status) {
        List<SocialAccount> accounts;
        if (status != null) {
            try {
                SocialAccountStatus statusEnum = SocialAccountStatus.valueOf(status.toUpperCase());
                accounts = socialAccountRepository.findAllByStatus(statusEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            accounts = socialAccountRepository.findAll();
        }
        return ResponseEntity.ok(accounts);
    }

    /**
     * Handles POST requests to /api/social-accounts.
     * Creates a new social account with the provided details.
     *
     * @param request The details of the social account to create.
     * @return A ResponseEntity containing the created SocialAccount and a status indicating the outcome.
     */
    @PostMapping
    public ResponseEntity<SocialAccount> createSocialAccount(@RequestBody CreateChannelRequest request) {
        SocialAccount account = new SocialAccount();
        account.setName(request.getName());
        account.setProvider(request.getProvider());
        account.setStatus(SocialAccountStatus.DISCONNECTED);
        SocialAccount savedAccount = socialAccountRepository.save(account);
        return ResponseEntity.status(201).body(savedAccount);
    }

    /**
     * Handles PUT requests to /api/social-accounts/{id}.
     * Updates the name of an existing social account.
     *
     * @param id      The ID of the social account to update.
     * @param request The new details for the social account.
     * @return A ResponseEntity containing the updated SocialAccount and an OK status.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SocialAccount> updateSocialAccountName(@PathVariable String id, @RequestBody UpdateChannelRequest request) {
        SocialAccount account = socialAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Social Account not found with id: " + id));
        account.setName(request.getName());
        SocialAccount updatedAccount = socialAccountRepository.save(account);
        return ResponseEntity.ok(updatedAccount);
    }

    @PutMapping("/{id}/disconnect")
    public ResponseEntity<SocialAccount> disconnectSocialAccount(@PathVariable String id) {
        SocialAccount account = socialAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Social Account not found with id: " + id));
        
        account.setStatus(SocialAccountStatus.DISCONNECTED);
        account.setProviderAccountId(null);
        account.setAccessToken(null);
        account.setRefreshToken(null);
        account.setExpiresAt(null);

        SocialAccount updatedAccount = socialAccountRepository.save(account);
        return ResponseEntity.ok(updatedAccount);
    }

    /**
     * Handles DELETE requests to /api/social-accounts/{id}.
     * Disconnects a social account by its ID.
     *
     * @param id The ID of the social account to disconnect.
     * @return A ResponseEntity with no content and a status indicating the outcome.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteSocialAccount(@PathVariable String id) {
        SocialAccount accountToDelete = socialAccountRepository.findById(id).orElse(null);

        if (accountToDelete == null) {
            return ResponseEntity.notFound().build();
        }

        // Find all posts that target this account
        List<Post> postsToUpdate = postRepository.findAllByTargetsContains(accountToDelete);

        // Remove the account from each post's target set
        for (Post post : postsToUpdate) {
            post.getTargets().remove(accountToDelete);
            postRepository.save(post);
        }

        // Now it's safe to delete the account
        socialAccountRepository.delete(accountToDelete);

        return ResponseEntity.noContent().build();
    }

    // You could add other endpoints here later, like:
    // DELETE /api/social-accounts/{id} to disconnect an account
}