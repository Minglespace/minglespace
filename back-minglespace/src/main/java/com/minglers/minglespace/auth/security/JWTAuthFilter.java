package com.minglers.minglespace.auth.security;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.exception.JwtExceptionCode;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.service.UserDetailsServiceImpl;
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
import java.util.Optional;

@Log4j2
@RequiredArgsConstructor
@Component
public class JWTAuthFilter extends OncePerRequestFilter {

  private final JWTUtils jwtUtils;
  private final UserDetailsServiceImpl userDetailsService;
  private final UserRepository userRepository;

  @Override
  protected void doFilterInternal(
          HttpServletRequest request,
          HttpServletResponse response,
          FilterChain filterChain) throws ServletException, IOException {

    String token = "";

    try {

      token = parseToken(request);

      tokenProcessing(token, request, response);

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

      // 에러 메시지를 로그로 출력
      log.error("Exception occurred in doFilterInternal: {}", e.getMessage());

      // 예외의 원인 (다른 예외가 있을 수 있는 경우)
      Throwable cause = e.getCause();
      if (cause != null) {
        log.error("!!! Cause of the exception: {}", cause.getMessage());
      }
      // 예외 타입 출력
      log.error("Exception type: {}", e.getClass().getName());
    }
  }

  private void tokenProcessing(String token, HttpServletRequest request, HttpServletResponse response){

    if(token == null || token.isEmpty() || token.isBlank())
      return;

    if(!jwtUtils.isAccessToken(token))
      return;

    log.info("==================================================");
    log.info("[MIRO] 필터 들어옴 URI: {}", request.getRequestURI());

    // 액세스 토큰 만료 체크,
    // 만료시 리프레시 토큰을 사용해서 액세스 토큰을 갱신한다.
    // 리프레시 토큰 만료시 예외 발생
    // 로그아웃 처리해야한다.
    token = checkExpiredToken(token, request, response);

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

  private String checkExpiredToken(String accessToken, HttpServletRequest request, HttpServletResponse response){
    if(!jwtUtils.isTokenExpired(accessToken))
      return accessToken;

    String refreshToken = CookieManager.get(JWTUtils.REFRESH_TOKEN, request);
    if(refreshToken == null) {
      request.setAttribute("exception", JwtExceptionCode.NOT_FOUND);
      throw new BadCredentialsException("토큰을 찾을 수 없습니다.");
    }

    if(jwtUtils.isTokenExpired(refreshToken)){
      request.setAttribute("exception", JwtExceptionCode.EXPIRED_TOKEN);
      throw new BadCredentialsException("리프레시 토큰도 만료 되었습니다.");
    }

    String userEmail = jwtUtils.extractUsername(accessToken);
    Optional<User> userOpt = userRepository.findByEmail(userEmail);
    if(!userOpt.isPresent()){
      request.setAttribute("exception", JwtExceptionCode.NOT_FOUND_USER);
      throw new BadCredentialsException("유저를 찾을 수 없습니다.");
    }

    log.info("[MIRO] accessToken 토큰이 만료되어 갱신했어요.");

    // 갱신한 accessToken 토큰으로 계속해서 요청을 진행한다.
    accessToken = jwtUtils.geneTokenAccess(userOpt.get());

    // 갱신한 accessToken은 헤더에 넣어준다.
    response.setHeader("Authorization", "Bearer " + accessToken);

    return accessToken;
  }

  private String parseToken(HttpServletRequest request) {
    // 헤더에서 토큰을 찾는다
    String authorization = request.getHeader("Authorization");
    if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer")){
      String[] arr = authorization.split(" ");
      log.info("[MIRO] 헤더에서 토큰 찾음 : {}", arr[1]);
      return arr[1];
    }
    return null;
  }
}
