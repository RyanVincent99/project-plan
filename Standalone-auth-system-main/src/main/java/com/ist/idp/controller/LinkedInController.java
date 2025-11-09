package com.ist.idp.controller;

import com.ist.idp.service.LinkedInOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@RestController
public class LinkedInController {

    private static final Logger logger = LoggerFactory.getLogger(LinkedInController.class);

    @Autowired
    private LinkedInOAuthService linkedInOAuthService;

    @Value("${linkedin.api.client-id}")
    private String clientId;
    @Value("${linkedin.api.redirect-uri}")
    private String redirectUri;
    @Value("${linkedin.api.scope}")
    private String scope;
    @Value("${linkedin.api.authorization-uri}")
    private String authorizationUri;

    @GetMapping({"/linkedin/authorize", "/linkedin/authorize/"})
    public void initiateAuthorization(HttpServletResponse response, @RequestParam("redirect_uri") String frontendRedirectUri) throws IOException {
        String state = frontendRedirectUri;

        String url = UriComponentsBuilder.fromUriString(authorizationUri)
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("state", state)
                .queryParam("scope", scope)
                .toUriString();
        response.sendRedirect(url);
    }

    @GetMapping("/linkedin/callback")
    public void handleCallback(@RequestParam("code") String code, @RequestParam("state") String state, HttpServletResponse httpServletResponse) throws IOException {
        String accessToken = linkedInOAuthService.getAccessToken(code);
        if (accessToken == null) {
            httpServletResponse.sendRedirect("/error?message=linkedin_token_exchange_failed");
            return;
        }

        String finalRedirectUrl = UriComponentsBuilder.fromUriString(state)
                .queryParam("access_token", accessToken)
                .build().toUriString();

        httpServletResponse.sendRedirect(finalRedirectUrl);
    }

    @PostMapping("/linkedin/post")
    @ResponseBody
    public ResponseEntity<?> publishPost(@RequestBody com.ist.idp.dto.request.LinkedInPostRequest request) {
        try {
            linkedInOAuthService.publishPost(request.getAccessToken(), request.getContent());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to publish post to LinkedIn", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}