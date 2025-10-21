package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class OAuthController {

    @Autowired
    private SocialAccountRepository socialAccountRepository;

    // This endpoint is what your "Connect" button will link to
    @GetMapping("/connect/linkedin")
    public RedirectView connectLinkedIn() {
        // This path matches the spring.security.oauth2.client.registration key
        return new RedirectView("/oauth2/authorization/linkedin");
    }

    // This is the callback URI you configured in your application.yml
    // It will be hit *after* the user authorizes on LinkedIn
    @GetMapping("/connect/linkedin/callback")
    public RedirectView linkedInCallback(
            @RegisteredOAuth2AuthorizedClient("linkedin") OAuth2AuthorizedClient authorizedClient,
            OAuth2AuthenticationToken authentication) {

        // 1. Get token details
        String provider = authorizedClient.getClientRegistration().getRegistrationId();
        String providerAccountId = authentication.getPrincipal().getName();
        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        String refreshToken = (authorizedClient.getRefreshToken() != null) ?
                                authorizedClient.getRefreshToken().getTokenValue() : null;
        LocalDateTime expiresAt = (authorizedClient.getAccessToken().getExpiresAt() != null) ?
                                  LocalDateTime.from(authorizedClient.getAccessToken().getExpiresAt()) : null;
        
        // 2. Get user's name
        String name = authentication.getPrincipal().getAttribute("localizedFirstName") + " " +
                      authentication.getPrincipal().getAttribute("localizedLastName");

        // 3. Save to database
        SocialAccount account = socialAccountRepository.findByProviderAndProviderAccountId(provider, providerAccountId)
                .orElse(new SocialAccount());
        
        account.setProvider(provider);
        account.setProviderAccountId(providerAccountId);
        account.setName(name);
        account.setAccessToken(accessToken);
        account.setRefreshToken(refreshToken);
        account.setExpiresAt(expiresAt);
        
        socialAccountRepository.save(account);

        // 4. Redirect user back to the frontend settings page
        return new RedirectView("http://localhost:3000/dashboard"); // Or a settings page
    }
}