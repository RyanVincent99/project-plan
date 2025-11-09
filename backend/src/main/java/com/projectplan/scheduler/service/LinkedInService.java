package com.projectplan.scheduler.service;

import com.projectplan.scheduler.repository.SocialAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class LinkedInService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private SocialAccountRepository socialAccountRepository;

    private final String authServiceUrl = "http://localhost:8081";

    public void connectLinkedInAccount(String code, Long socialAccountId) {
        // Exchange the authorization code for an access token
        String tokenUrl = authServiceUrl + "/linkedin/callback?code=" + code;
        // This is a simplified example. In a real application, you would handle the response properly.
        // The auth service should return the access token and other user information.
        // You would then store this information in your database.
        String response = restTemplate.postForObject(tokenUrl, null, String.class);

        // For now, we'll just log the response.
        System.out.println("Response from auth service: " + response);

        // Update the social account status to CONNECTED
        socialAccountRepository.findById(socialAccountId).ifPresent(account -> {
            account.setStatus(com.projectplan.scheduler.model.SocialAccountStatus.CONNECTED);
            // You would also store the access token and other details here.
            socialAccountRepository.save(account);
        });
    }
}
