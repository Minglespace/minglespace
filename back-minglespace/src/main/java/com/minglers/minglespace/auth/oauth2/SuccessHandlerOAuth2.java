package com.minglers.minglespace.auth.oauth2;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.security.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
@Component
public class SuccessHandlerOAuth2 extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtils jwtUtils;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2UserMs oAuth2UserMs = (OAuth2UserMs) authentication.getPrincipal();


        User user = oAuth2UserMs.getUser();

        log.info("[MIRO] 로그인 성공, user : {}", user.getEmail());

        // 토큰 생성
        String accessToken = jwtUtils.geneTokenAccess(user);
        String refreshToken = jwtUtils.geneTokenRefresh(user);

        response.addCookie(createCookie("Authorization", accessToken, JWTUtils.EXPIRATION_ACCESS));
        response.sendRedirect("http://localhost:3000/auth/token");

    }

    private Cookie createCookie(String key, String value, Long expiration) {

        Cookie cookie = new Cookie(key, value);

        int expirationSec = (int)(expiration / 1000);

        cookie.setMaxAge(expirationSec);
        //cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setHttpOnly(true);

        return cookie;
    }

}
