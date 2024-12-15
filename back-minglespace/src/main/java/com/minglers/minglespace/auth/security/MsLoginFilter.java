package com.minglers.minglespace.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minglers.minglespace.auth.dto.LoginRequest;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
public class MsLoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JWTUtils jwtUtils;
    private final UserRepository userRepository;

    @Override
    public Authentication attemptAuthentication(
            HttpServletRequest request,
            HttpServletResponse response) throws AuthenticationException {

        String requestUri = request.getRequestURI();
        log.info("[MIRO] 로그인 필터 들어옴 requestUri : {}",requestUri);

        LoginRequest loginRequest = getLoginRequest(request);
        if(loginRequest == null){
            throw new AuthException(HttpStatus.BAD_REQUEST.value(), "로그인 정보 오류");
        }

        String validation = loginRequest.validation();
        if(validation != null){
            throw new AuthException(HttpStatus.BAD_REQUEST.value(), validation);
        }

        // try authentication
        log.info("[MIRO] 로그인 authentication 인증 시도");
        //log.info("[MIRO] loginRequest : {}", loginRequest.toString());

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword(),
                null);

        return authenticationManager.authenticate(authToken);

//        try {
//            return authenticationManager.authenticate(authToken);
//        }catch (Exception e){
//            log.info("[MIRO] 로그인 인증 실패 : {}", e.getMessage());
//
//            response.setContentType("application/json");
////            String jsonResponse = "로그인에 실패 했습니다.";
//
//            try {
//                response.getWriter().write(e.getMessage());
//            } catch (IOException ex) {
//                throw new RuntimeException(ex);
//            }
//            response.setStatus(HttpStatus.UNAUTHORIZED.value());
//
//            throw e;
//        }
    }

    private LoginRequest getLoginRequest(HttpServletRequest request){
        ObjectMapper objectMapper = new ObjectMapper();
        LoginRequest loginRequest = null;

        try {
            loginRequest = objectMapper.readValue(request.getInputStream(), LoginRequest.class);
        } catch (IOException e) {
            log.info("getLoginRequest : {}", e.getMessage());
//            throw  new AuthException(HttpStatus.BAD_REQUEST.value(), "이메일 또는 비밀번호를 확인하세요.");
        }

        return loginRequest;
    }

    @Override
    protected void successfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain,
            Authentication authentication) {

        log.info("[MIRO] 로그인 authentication 인증 성공");

        // role
        {
//            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
//            Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
//            GrantedAuthority auth = iterator.next();
//            String role = auth.getAuthority();
//            log.info("[MIRO] role : {}", role);
        }

        User user = (User)authentication.getPrincipal();
        if(user.getVerificationCode().isEmpty()){
            // 토큰 생성
            String accessToken = jwtUtils.geneTokenAccess(user);
            String refreshToken = jwtUtils.geneTokenRefresh(user);

            log.info("accessToken : {}", accessToken);
            log.info("refreshToken : {}", refreshToken);

//            response.setHeader(JWTUtils.TOKEN_NAME_ACCESS, accessToken);
//            response.setHeader("Authorization", "Bearer " + accessToken);

            response.addCookie(createCookie(JWTUtils.TOKEN_NAME_REFRESH, refreshToken, JWTUtils.EXPIRATION_TIME_R));
//            ResponseCookie cookie = createCookie2(
//
//                    JWTUtils.TOKEN_NAME_REFRESH,
//                    refreshToken,
//                    JWTUtils.EXPIRATION_TIME_R);

//            response.setHeader("Set-Cookie", cookie.toString());

            try {

                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put("code", 200);
                responseMap.put("message", "유저 로그인 성공");
                responseMap.put("accessToken", accessToken);

                ObjectMapper objectMapper = new ObjectMapper();
                String jsonResponse = objectMapper.writeValueAsString(responseMap);

                response.setContentType("application/json");
                response.setStatus(HttpStatus.OK.value());
                response.getWriter().write(jsonResponse);

                log.error("[MIRO] 로그인 결과 : {}", jsonResponse);

            } catch (IOException e) {
                log.error("[MIRO] 응답 작성 중 오류 발생: ", e);
            }
        }else{
            String msg = "먼저, 이메일 인증을 완료하세요.";
            log.info("[MIRO] {}", msg);
            try {
                response.setContentType("application/json");
                response.setStatus(HttpStatus.BAD_REQUEST.value());
                response.getWriter().write(msg);
            } catch (IOException e) {
                log.error("[MIRO] 응답 작성 중 오류 발생: ", e);
            }
        }
    }

    @Override
    protected void unsuccessfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException failed) throws IOException {

        log.info("[MIRO] : 로그인 인증 실패 : {}", failed.getMessage());

        LoginRequest loginRequest = getLoginRequest(request);
        if(loginRequest == null){
            response.setContentType("application/json");
            String jsonResponse = "로그인 정보 오류.";

            response.getWriter().write(jsonResponse);
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return;
//            throw new AuthException(HttpStatus.BAD_REQUEST.value(), "로그인 정보 오류");
        }

        if(!userRepository.existsByEmail(loginRequest.getEmail())){
            response.setContentType("application/json");
            String jsonResponse = "존제하지 않는 계정 입니다.";

            response.getWriter().write(jsonResponse);
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return;
//            throw new AuthException(HttpStatus.BAD_REQUEST.value(), "존제하지 않는 계정 입니다.");
        }


        response.setContentType("application/json");
        String jsonResponse = "로그인에 실패 했습니다.";

        response.getWriter().write(jsonResponse);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
    }

    private ResponseCookie createCookie2(String key, String value, long expirationMilli){
        return ResponseCookie.from(key, value)
            .maxAge(expirationMilli / 1000)
            .path("/")
//            .secure(true)
            .sameSite("None")
            .httpOnly(true)
            .build();
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
