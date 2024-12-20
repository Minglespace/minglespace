package com.minglers.minglespace.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.JwtExceptionCode;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserDetailsServiceImpl;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.util.CookieManager;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
import java.util.Optional;

@Log4j2
@RequiredArgsConstructor
@Component
public class JWTAuthFilter extends OncePerRequestFilter {

  private final JWTUtils jwtUtils;
  private final UserDetailsServiceImpl userDetailsService;
  private final UserRepository userRepository;
  private final TokenBlacklistService tokenBlacklistService;

  @Override
  protected void doFilterInternal(
          HttpServletRequest request,
          HttpServletResponse response,
          FilterChain filterChain) throws ServletException, IOException {

    String accessToken = "";

    try {

      accessToken = parseToken(request);

      if(accessToken != null && !accessToken.isEmpty() && !accessToken.isBlank()){
        if(!checkAccessTokenValidation(accessToken, request, response)){
          accessToken = updateAccessToken(request, response);
          if(accessToken == null){
            return;
          }
        }
        addTokenToContext(accessToken, request, response);
      }

      filterChain.doFilter(request, response);

    }catch (NullPointerException | IllegalStateException e) {
      request.setAttribute("exception", JwtExceptionCode.NOT_FOUND_TOKEN);
      throw new BadCredentialsException("throw new not found token exception");
    } catch (SecurityException | MalformedJwtException e) {
      request.setAttribute("exception", JwtExceptionCode.INVALID_TOKEN);
      throw new BadCredentialsException("throw new invalid token exception");
    } catch (UnsupportedJwtException e) {
      request.setAttribute("exception", JwtExceptionCode.UNSUPPORTED_TOKEN);
      throw new BadCredentialsException("throw new unsupported token exception");
    } catch (Exception e){

      log.error("Exception type: {}", e.getClass().getName());
      log.error("Exception occurred in doFilterInternal: {}", e.getMessage());
      Throwable cause = e.getCause();
      if (cause != null) {
        log.error("!!! Cause of the exception: {}", cause.getMessage());
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

  private boolean checkAccessTokenValidation(String accessToken, HttpServletRequest request, HttpServletResponse response){
    try {
      if(!jwtUtils.isTokenExpired(accessToken)){
        return true;
      }
    } catch (ExpiredJwtException e){
      log.info("액세스 토큰을 갱신하세요.");
      return false;
    }

    return false;
  }

  private String updateAccessToken(HttpServletRequest request, HttpServletResponse response) throws IOException {

    String refreshToken = CookieManager.get(JWTUtils.REFRESH_TOKEN, request);
    if(refreshToken == null) {

      log.info("리프레시도 만료 되었어요");

      response.setStatus(HttpServletResponse.SC_OK);
      response.setContentType("application/json");

      ObjectMapper objectMapper = new ObjectMapper();
      String jsonResponse = objectMapper.writeValueAsString(new DefaultResponse(AuthStatus.ExpiredRefreshToken));

      response.getWriter().write(jsonResponse);
      return null;
    }

    if(tokenBlacklistService.isBlacklisted(refreshToken)){
      log.error("================================================");
      log.error("어뷰저 딱걸림.");
      throw new BadCredentialsException("UNAUTHORIZED 잘못된 자격 증명");
    }

    if(jwtUtils.isTokenExpired(refreshToken)){
      request.setAttribute("exception", JwtExceptionCode.EXPIRED_TOKEN);
      throw new BadCredentialsException("리프레시 토큰도 만료 되었습니다.");
    }

    String userEmail = jwtUtils.extractUsername(refreshToken);
    Optional<User> userOpt = userRepository.findByEmail(userEmail);
    if(!userOpt.isPresent()){
      request.setAttribute("exception", JwtExceptionCode.NOT_FOUND_USER);
      throw new BadCredentialsException("유저를 찾을 수 없습니다.");
    }

    log.info("[MIRO] accessToken 토큰이 만료되어 갱신했어요.");

    String accessToken = jwtUtils.geneTokenAccess(userOpt.get());

    response.setHeader("Authorization", "Bearer " + accessToken);

    return accessToken;
  }

  private void addTokenToContext(String token, HttpServletRequest request, HttpServletResponse response){

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
