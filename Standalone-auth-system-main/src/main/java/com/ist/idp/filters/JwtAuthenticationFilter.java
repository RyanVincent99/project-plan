package com.ist.idp.filters;

import com.ist.idp.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final List<String> publicEndpoints = Arrays.asList(
            "/api/auth/**",
            "/.well-known/jwks.json",
            "/health",
            "/linkedin/**"
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        logger.info("Request path in JwtAuthenticationFilter: {}", requestPath);
        logger.info("Request URL in JwtAuthenticationFilter: {}", request.getRequestURL().toString());

        // Skip JWT validation for public endpoints using AntPathMatcher
        if (publicEndpoints.stream().anyMatch(p -> pathMatcher.match(p, requestPath))) {
            logger.info("Path {} is public, skipping JWT validation.", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        logger.warn("Path {} is not public, proceeding with JWT validation.", requestPath);

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Pass to the next filter
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            final String userEmail = jwtService.getSubjectFromToken(jwt);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // Credentials are not needed as the token is already validated
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            System.out.println("Failed to validate JWT: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
