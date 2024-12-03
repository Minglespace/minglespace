package com.minglers.minglespace.auth.security;

import com.minglers.minglespace.auth.exception.JwtExceptionCode;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Log4j2
@RequiredArgsConstructor
@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    private final JWTUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();

        String contextPath = request.getContextPath();
        String servletPath = request.getServletPath();
        String queryString = request.getQueryString();

        String fullURL = scheme + "://" + serverName + ":" + serverPort + contextPath + servletPath + (queryString != null ? "?" + queryString : "");

        log.info("");
        log.info("");
        log.info("");
        log.info("==================================================");
        log.info("Full URL: {}", fullURL);
        log.info("Request URI: {}", request.getRequestURI());
        log.info("Query String: {}", queryString);
        log.info("~end");
        log.info("");
        log.info("");
        log.info("");

        String token = "";

        try {

            token = parseToken(request);

            tokenProcessing(token, request);

            filterChain.doFilter(request, response);

        }catch (NullPointerException | IllegalStateException e) {
            request.setAttribute("exception", JwtExceptionCode.NOT_FOUND_TOKEN);
            throw new BadCredentialsException("throw new not found token exception");
        } catch (SecurityException | MalformedJwtException e) {
            request.setAttribute("exception", JwtExceptionCode.INVALID_TOKEN);
            throw new BadCredentialsException("throw new invalid token exception");
        } catch (ExpiredJwtException e) {
            request.setAttribute("exception", JwtExceptionCode.EXPIRED_TOKEN);
            throw new BadCredentialsException("throw new expired token exception");
        } catch (UnsupportedJwtException e) {
            request.setAttribute("exception", JwtExceptionCode.UNSUPPORTED_TOKEN);
            throw new BadCredentialsException("throw new unsupported token exception");
        } catch (Exception e){

            log.error("");
            log.error("");
            log.error("");
            log.error("========================================================");

            // 스택 트레이스를 콘솔에 출력
            e.printStackTrace();

            // 에러 메시지를 로그로 출력
            log.error("Exception occurred in doFilterInternal: {}", e.getMessage());

            // 예외의 전체 스택 트레이스를 로그로 출력
            //log.error("Full stack trace: ", e);

            // 예외의 원인 (다른 예외가 있을 수 있는 경우)
            Throwable cause = e.getCause();
            if (cause != null) {
                log.error("!!! Cause of the exception: {}", cause.getMessage());
            }
            // 예외 타입 출력
            log.error("Exception type: {}", e.getClass().getName());
            log.error("~end");
            log.error("");
            log.error("");
            log.error("");
        }
    }

    private void tokenProcessing(String token, HttpServletRequest request){

        if (token != null && !token.isBlank()) {

            if(tokenBlacklistService.isBlacklisted(token)){
                throw new BadCredentialsException("UNAUTHORIZED 잘못된 자격 증명");
            }

            final String userEmail = jwtUtils.extractUsername(token);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtUtils.isTokenValid(token, userDetails)) {

                    SecurityContext securityContext
                            = SecurityContextHolder.createEmptyContext();

                    UsernamePasswordAuthenticationToken UPA_token
                            = new UsernamePasswordAuthenticationToken(
                                userDetails,
                            null,
                                userDetails.getAuthorities());

                    UPA_token.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    securityContext.setAuthentication(UPA_token);
                    SecurityContextHolder.setContext(securityContext);
                }
            }
        }
    }

    private String parseToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer")){
            String[] arr = authorization.split(" ");
            return arr[1];
        }
        return null;
    }
}
