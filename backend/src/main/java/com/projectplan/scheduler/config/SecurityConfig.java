package com.projectplan.scheduler.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Apply your WebConfig CORS settings
            .cors(withDefaults())
            
            // 2. Disable CSRF, which is not needed for a stateless API
            .csrf(csrf -> csrf.disable())
            
            // 3. Configure URL permissions
            .authorizeHttpRequests(authz -> authz
                // 4. This is the fix: Allow all requests to your API and OAuth endpoints
                .requestMatchers("/api/**", "/oauth2/**").permitAll()
                
                // 5. Secure all other endpoints (though you may not have any)
                .anyRequest().authenticated()
            )
            
            // 6. Enable the default OAuth2 login flow
            .oauth2Login(withDefaults());

        return http.build();
    }
}