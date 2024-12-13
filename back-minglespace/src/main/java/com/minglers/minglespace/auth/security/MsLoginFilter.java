package com.minglers.minglespace.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minglers.minglespace.auth.dto.LoginRequest;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

@Log4j2
@RequiredArgsConstructor
public class MsLoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JWTUtils jwtUtils;
//    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;


    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {

        log.info("[MIRO] : attemptAuthentication 호출됨");


        ObjectMapper objectMapper = new ObjectMapper();
        LoginRequest loginRequest = null;

        try {
            loginRequest = objectMapper.readValue(request.getInputStream(), LoginRequest.class);
        } catch (IOException e) {
            throw new AuthenticationException("Invalid request body") {};
        }

        log.info("[MIRO] loginRequest getEmail : {}", loginRequest.getEmail());
        log.info("[MIRO] loginRequest getPassword : {}", loginRequest.getPassword());

        // try authentication
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword(), null);
        return authenticationManager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication) {

        log.info("[MIRO] : successfulAuthentication 호출됨");

        User user = (User)authentication.getPrincipal();


        String username = user.getUsername();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();

        String role = auth.getAuthority();

        log.info("[MIRO] role : {}", role);

        String accessToken = jwtUtils.geneTokenAccess(user);
        String refreshToken = jwtUtils.geneTokenRefresh(user);

        log.info("accessToken : {}", accessToken);
        log.info("refreshToken : {}", refreshToken);

//        response.addHeader("Authorization", "Bearer " + accessToken);

        response.setHeader(JWTUtils.TOKEN_NAME_ACCESS, accessToken);
        response.addCookie(createCookie("refreshToken", refreshToken, JWTUtils.EXPIRATION_TIME_R));
        response.setStatus(HttpStatus.OK.value());
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) {

        log.info("[MIRO] : unsuccessfulAuthentication 호출됨");

        response.setStatus(401);
    }

    private Cookie createCookie(String key, String value, long expirationMilli) {

        Cookie cookie = new Cookie(key, value);

        cookie.setMaxAge((int)(expirationMilli / 1000));

        // https 사용할때 설정한다.
        //cookie.setSecure(true);

        // 쿠키가 적용될 범위
        //cookie.setPath("/");

        // 클라이언트 단에서 자바스크립트로 쿠키 접근을 막는다
        cookie.setHttpOnly(true);

        return cookie;
    }
}
