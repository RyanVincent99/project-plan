package com.projectplan.scheduler.service;

import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.SocialAccount;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Service
public class PublishingService {

    private final RestTemplate restTemplate = new RestTemplate();

    public void publishPost(Post post) {
        for (SocialAccount target : post.getTargets()) {
            if ("discord".equalsIgnoreCase(target.getProvider())) {
                publishToDiscord(target, post);
            } else if ("linkedin".equalsIgnoreCase(target.getProvider())) {
                publishToLinkedIn(target, post);
            }
        }
    }

    private void publishToLinkedIn(SocialAccount account, Post post) {
        String authServiceUrl = "http://auth-app:8080";
        String url = authServiceUrl + "/linkedin/post";

        Map<String, String> payload = new HashMap<>();
        payload.put("accessToken", account.getAccessToken());
        payload.put("content", post.getContent());

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, payload, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to publish to LinkedIn for account " + account.getName() + ": " + response.getBody());
            }
            System.out.println("Successfully published to LinkedIn for account: " + account.getName());
        } catch (Exception e) {
            throw new RuntimeException("Failed to publish to LinkedIn for account " + account.getName() + ": " + e.getMessage());
        }
    }

    private void publishToDiscord(SocialAccount account, Post post) {
        String webhookUrl = account.getAccessToken(); // We store URL in accessToken field
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            System.err.println("Discord webhook URL is missing for account: " + account.getName());
            return;
        }

        // Discord webhook expects a JSON payload with a "content" key
        Map<String, String> payload = new HashMap<>();
        payload.put("content", post.getContent());

        try {
            restTemplate.postForEntity(webhookUrl, payload, String.class);
            System.out.println("Successfully published to Discord channel: " + account.getName());
        } catch (Exception e) {
            System.err.println("Failed to publish to Discord for account " + account.getName() + ": " + e.getMessage());
        }
    }
}
