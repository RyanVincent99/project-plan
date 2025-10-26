package com.projectplan.scheduler.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
// FIXED: implement the correct interface
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.util.Base64Utils;
import org.springframework.util.SerializationUtils;

import java.util.Arrays;
import java.util.Optional;

/**
 * Cookie-backed repository for OAuth2AuthorizationRequest.
 *
 * Implements AuthorizationRequestRepository<OAuth2AuthorizationRequest>
 * and stores the serialized request in a short-lived HttpOnly cookie.
 */
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTH_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    private static final int COOKIE_EXPIRE_SECONDS = 180;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookie(request, OAUTH2_AUTH_REQUEST_COOKIE_NAME)
            .map(cookie -> deserialize(cookie.getValue()))
            .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteCookie(response, OAUTH2_AUTH_REQUEST_COOKIE_NAME);
            deleteCookie(response, REDIRECT_URI_PARAM_COOKIE_NAME);
            return;
        }

        String serialized = serialize(authorizationRequest);
        addCookie(response, OAUTH2_AUTH_REQUEST_COOKIE_NAME, serialized, COOKIE_EXPIRE_SECONDS);

        String redirectUriAfterLogin = request.getParameter(REDIRECT_URI_PARAM_COOKIE_NAME);
        if (redirectUriAfterLogin != null && !redirectUriAfterLogin.isEmpty()) {
            addCookie(response, REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin, COOKIE_EXPIRE_SECONDS);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        // read from cookie and return; caller should clear cookies after response is available
        OAuth2AuthorizationRequest req = getCookie(request, OAUTH2_AUTH_REQUEST_COOKIE_NAME)
            .map(cookie -> deserialize(cookie.getValue()))
            .orElse(null);
        return req;
    }

    /**
     * Helper to remove cookies when response is available.
     */
    public void removeAuthorizationRequestCookies(HttpServletRequest request, HttpServletResponse response) {
        deleteCookie(response, OAUTH2_AUTH_REQUEST_COOKIE_NAME);
        deleteCookie(response, REDIRECT_URI_PARAM_COOKIE_NAME);
    }

    private Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
            .filter(c -> c.getName().equals(name))
            .findFirst();
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    private void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String serialize(OAuth2AuthorizationRequest obj) {
        byte[] bytes = SerializationUtils.serialize(obj);
        return Base64Utils.encodeToUrlSafeString(bytes);
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        byte[] bytes = Base64Utils.decodeFromUrlSafeString(value);
        Object obj = SerializationUtils.deserialize(bytes);
        return (OAuth2AuthorizationRequest) obj;
    }
}