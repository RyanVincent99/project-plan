package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/")
public class OAuthController {

    // This is no longer needed here as the logic is in the success handler.
    // @Autowired
    // private SocialAccountRepository socialAccountRepository;

    @GetMapping("/connect/{provider}/{accountId}")
    public RedirectView connectWithAccount(@PathVariable String provider, @PathVariable String accountId, HttpServletRequest request) {
        request.getSession().setAttribute("connectAccountId", accountId);
        return new RedirectView("/oauth2/authorization/" + provider);
    }

    // The custom callback is no longer needed and should be removed.
    // Spring Security handles the /login/oauth2/code/* callback internally
    // and then passes control to our CustomAuthenticationSuccessHandler.
}