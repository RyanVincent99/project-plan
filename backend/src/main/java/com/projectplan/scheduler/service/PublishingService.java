package com.projectplan.scheduler.service;

import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.SocialAccount;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PublishingService {

    private final RestTemplate restTemplate = new RestTemplate();

    public void publishPost(Post post) {
        for (SocialAccount target : post.getTargets()) {
            if ("discord".equalsIgnoreCase(target.getProvider())) {
                publishToDiscord(target, post);
            }
            // Add other providers here later
            // else if ("linkedin".equalsIgnoreCase(target.getProvider())) { ... }
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
