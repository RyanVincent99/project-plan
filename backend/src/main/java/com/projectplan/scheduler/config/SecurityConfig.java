package com.projectplan.scheduler.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/**", "/oauth2/**", "/login/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                    .authorizationRequestRepository(authorizationRequestRepository())
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService()) // Use our custom user service
                )
                .successHandler((request, response, authentication) -> {
                    customAuthenticationSuccessHandler.onAuthenticationSuccess(request, response, authentication);

                    if (authorizationRequestRepository() instanceof com.projectplan.scheduler.config.HttpCookieOAuth2AuthorizationRequestRepository) {
                        ((com.projectplan.scheduler.config.HttpCookieOAuth2AuthorizationRequestRepository) authorizationRequestRepository())
                            .removeAuthorizationRequestCookies(request, response);
                    }
                })
                .failureHandler((request, response, exception) -> {
                    System.err.println("OAuth2 Authentication failed: " + exception.getMessage());
                    exception.printStackTrace();
                    if (authorizationRequestRepository() instanceof com.projectplan.scheduler.config.HttpCookieOAuth2AuthorizationRequestRepository) {
                        ((com.projectplan.scheduler.config.HttpCookieOAuth2AuthorizationRequestRepository) authorizationRequestRepository())
                            .removeAuthorizationRequestCookies(request, response);
                    }
                    response.sendRedirect("http://localhost:3000/dashboard?error=true");
                })
            );

        return http.build();
    }

    /**
     * A custom OAuth2UserService to handle different providers.
     * For Discord's 'webhook.incoming' scope, it constructs a dummy user principal
     * without calling a user-info-endpoint, which doesn't exist for this flow.
     * For other providers, it delegates to the default service.
     */
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

        return (userRequest) -> {
            String clientRegistrationId = userRequest.getClientRegistration().getRegistrationId();

            // Handle Discord's webhook flow which doesn't have a user info endpoint
            if ("discord".equals(clientRegistrationId)) {
                Map<String, Object> additionalParameters = userRequest.getAdditionalParameters();
                Map<String, Object> attributes = new HashMap<>(additionalParameters);
                
                // The principal's "name" is taken from the user-name-attribute.
                // We'll use the webhook ID for this.
                Map<String, Object> webhook = (Map<String, Object>) additionalParameters.get("webhook");
                String nameAttributeKey = "id"; // Must match user-name-attribute in yml
                if (webhook != null && webhook.containsKey("id")) {
                    attributes.put(nameAttributeKey, webhook.get("id"));
                } else {
                    // Fallback in case webhook info is missing
                    attributes.put(nameAttributeKey, "discord_webhook");
                }
                
                Set<GrantedAuthority> authorities = new HashSet<>();
                authorities.add(new OAuth2UserAuthority(attributes));
                
                return new DefaultOAuth2User(authorities, attributes, nameAttributeKey);
            }

            // For other providers like LinkedIn, use the default behavior
            return delegate.loadUser(userRequest);
        };
    }

    /**
     * Return the interface type so we can return our implementation.
     * Switched to HttpSessionOAuth2AuthorizationRequestRepository to avoid invalid_nonce issues.
     */
    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository() {
        return new HttpSessionOAuth2AuthorizationRequestRepository();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow both frontend and backend origins so cookies and redirects work locally
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}