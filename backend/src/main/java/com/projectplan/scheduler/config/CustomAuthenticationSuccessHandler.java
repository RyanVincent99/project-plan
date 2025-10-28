package com.projectplan.scheduler.config;

import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.model.SocialAccountStatus;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private SocialAccountRepository socialAccountRepository;

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String clientRegistrationId = oauthToken.getAuthorizedClientRegistrationId();

        HttpSession session = request.getSession(false);
        String accountId = null;
        if (session != null) {
            accountId = (String) session.getAttribute("connectAccountId");
            if (accountId != null) {
                session.removeAttribute("connectAccountId");
            }
        }

        if ("discord".equals(clientRegistrationId)) {
            handleDiscordLogin(oauthToken, accountId);
        } else if ("linkedin".equals(clientRegistrationId)) {
            handleLinkedInLogin(oauthToken, accountId);
        }

        // After successfully handling the token, clear the security context
        // to prevent the backend from maintaining a session for this OAuth2 login.
        // This is crucial because we are using this flow to LINK an account, not to LOG IN.
        SecurityContextHolder.clearContext();

        // 4. Redirect user back to the frontend dashboard
        response.sendRedirect("http://localhost:3000/dashboard/settings/channels");
    }

    private void handleLinkedInLogin(OAuth2AuthenticationToken oauthToken, String accountId) {
        String clientRegistrationId = oauthToken.getAuthorizedClientRegistrationId();

        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
            clientRegistrationId,
            oauthToken.getName()
        );

        // 1. Extract user info and tokens
        OidcUser oidcUser = (OidcUser) oauthToken.getPrincipal();
        String providerAccountId = oidcUser.getSubject();
        String name = oidcUser.getFullName();
        
        OAuth2AccessToken accessToken = client.getAccessToken();
        OAuth2RefreshToken refreshToken = client.getRefreshToken();

        // 2. Check if account already exists
        SocialAccount account;
        if (accountId != null) {
            account = socialAccountRepository.findById(accountId)
                    .orElseThrow(() -> new RuntimeException("Social Account not found with id: " + accountId));
        } else {
            account = socialAccountRepository.findByProviderAndProviderAccountId(clientRegistrationId, providerAccountId)
                .orElse(new SocialAccount());
        }

        // 3. Update or create the social account entity
        account.setProvider(clientRegistrationId);
        account.setStatus(SocialAccountStatus.CONNECTED);
        account.setProviderAccountId(providerAccountId);
        account.setName(name);
        account.setAccessToken(accessToken.getTokenValue());
        
        if (refreshToken != null) {
            account.setRefreshToken(refreshToken.getTokenValue());
        }
        
        Instant expiresAtInstant = accessToken.getExpiresAt();
        LocalDateTime expiresAt = LocalDateTime.ofInstant(expiresAtInstant, ZoneId.systemDefault());
        account.setExpiresAt(expiresAt);
        
        socialAccountRepository.save(account);
    }

    private void handleDiscordLogin(OAuth2AuthenticationToken oauthToken, String accountId) {
        OAuth2User principal = oauthToken.getPrincipal();
        Map<String, Object> attributes = principal.getAttributes();
        
        Map<String, Object> webhook = (Map<String, Object>) attributes.get("webhook");
        if (webhook == null) {
            System.err.println("Discord webhook information not found in token response.");
            return;
        }

        String webhookId = (String) webhook.get("id");
        String webhookToken = (String) webhook.get("token");
        String channelId = (String) webhook.get("channel_id");
        String guildId = (String) webhook.get("guild_id");

        // We can't get channel/guild name from this response.
        // Let's create a descriptive name.
        String accountName = String.format("Discord (Server: %s, Channel: %s)", guildId, channelId);

        // Construct the full webhook URL
        String webhookUrl = String.format("https://discord.com/api/webhooks/%s/%s", webhookId, webhookToken);

        // Check if an account for this webhook already exists
        SocialAccount account;
        if (accountId != null) {
            account = socialAccountRepository.findById(accountId)
                    .orElseThrow(() -> new RuntimeException("Social Account not found with id: " + accountId));
        } else {
            account = socialAccountRepository.findByProviderAndProviderAccountId("discord", webhookId)
                .orElse(new SocialAccount());
        }

        account.setProvider("discord");
        account.setStatus(SocialAccountStatus.CONNECTED);
        account.setProviderAccountId(webhookId); // Use webhook ID as the unique ID for this provider
        account.setName(accountName);
        account.setAccessToken(webhookUrl); // Store the full URL
        account.setRefreshToken(null); // Not applicable
        account.setExpiresAt(null); // Webhooks don't expire

        socialAccountRepository.save(account);
    }
}