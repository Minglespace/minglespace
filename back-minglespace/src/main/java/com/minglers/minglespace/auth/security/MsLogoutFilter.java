package com.minglers.minglespace.auth.security;

import com.minglers.minglespace.auth.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.filter.GenericFilterBean;
import org.springframework.web.util.WebUtils;

import java.io.IOException;
import java.time.LocalDateTime;

@Log4j2
@RequiredArgsConstructor
public class MsLogoutFilter extends GenericFilterBean {

  private final JWTUtils jwtUtils;
  private final TokenBlacklistService tokenBlacklistService;

  @Override
  public void doFilter(
          ServletRequest servletRequest,
          ServletResponse servletResponse,
          FilterChain filterChain) throws IOException, ServletException {

//    doFilterTest((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse, filterChain);
    doFilter((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse, filterChain);
  }


  private void doFilterTest(
          HttpServletRequest request,
          HttpServletResponse response,
          FilterChain filterChain) throws IOException, ServletException {

    String requestUri = request.getRequestURI();
    log.info("[MIRO] 로그아웃 test 필터 들어옴 requestUri : {}",requestUri);

  }

    private void doFilter(
          HttpServletRequest request,
          HttpServletResponse response,
          FilterChain filterChain) throws IOException, ServletException {

    String requestUri = request.getRequestURI();
    log.info("[MIRO] 로그아웃 필터 들어옴 requestUri : {}",requestUri);

    if (!requestUri.matches("/auth/logout")) {
      filterChain.doFilter(request, response);
      return;
    }

    String requestMethod = request.getMethod();
    if (!requestMethod.equals("POST")) {
      filterChain.doFilter(request, response);
      return;
    }

    log.info("[MIRO] 로그아웃 요청 url 맞음");

//    Cookie refresh = WebUtils.getCookie(request, JWTUtils.TOKEN_NAME_REFRESH);
//    log.info("[MIRO] cookie : {}", refresh);
//
//    log.info("[MIRO] cookie.getValue : {}", refresh.getValue());


    // 중복코드 : 처리 필요
    String refreshToken = null;
    Cookie[] cookies = request.getCookies();
    for (Cookie cookie : cookies) {

      if (cookie.getName().equals(JWTUtils.TOKEN_NAME_REFRESH)) {

        log.info("cookie.getName() : {}", cookie.getName());
        log.info("equals name : {}", JWTUtils.TOKEN_NAME_REFRESH);

        refreshToken = cookie.getValue();
      }
    }

    if (refreshToken == null) {
      log.info("[MIRO] 로그아웃시에 쿠키에 토큰이 있어야 합니다.");
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!jwtUtils.isRefreshToken(refreshToken)) {
      log.info("[MIRO] 리프래시 토큰이여야 합니다.");
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    // 만료되지 않는 토큰만,
    // 로그 아웃시에 리프레시 토큰을 블랙티스팅 합니다.
    if(!jwtUtils.isTokenExpired(refreshToken)){
      if(!tokenBlacklistService.isBlacklisted(refreshToken)){
        LocalDateTime expiresAt = jwtUtils.extractExpiration(refreshToken);
        tokenBlacklistService.addToBlacklist(refreshToken, expiresAt);
      }
    }


//    // for test
//    {
//      // 쿠키 이름을 배열로 설정하여 모든 쿠키를 삭제합니다.
//      Cookie[] cookies2 = request.getCookies();
//      if (cookies2 != null) {
//        for (Cookie cookie2 : cookies2) {
//          log.info("쿠키 삭제 : {}", cookie2.getName());
//          cookie2.setValue(null); // 쿠키 값을 null로 설정
//          cookie2.setMaxAge(0); // 쿠키 만료 시간 설정 (0초로 설정)
//          cookie2.setPath("/"); // 쿠키의 path를 /로 설정하여 모든 경로에서 접근 가능하게 설정
//          response.addCookie(cookie2); // 만료된 쿠키를 응답에 추가
//        }
//      }
//    }


    // 쿠키에 있는 리프레시 토큰을 제거 합니다.
    log.info("[MIRO] 쿠키에 있는 리프레시 토큰을 제거 합니다.");
    Cookie cookie = new Cookie(JWTUtils.TOKEN_NAME_REFRESH, null);
    cookie.setMaxAge(0);
    cookie.setPath("/");
    response.addCookie(cookie);
    log.info("[MIRO] access 토큰은 Front-end에서 제거 하세요.");


//    // for test
//    {
//      log.info("남아있는 쿠키 확인 : ");
//
//      Cookie[] cookies3 = request.getCookies();
//      for (Cookie cookie3 : cookies3) {
//
//        log.info("cookie.getName() : {}", cookie.getName());
//        log.info("cookie.getValue() : {}", cookie.getValue());
//
//      }
//    }

    response.setStatus(HttpServletResponse.SC_OK);

    log.info("[MIRO] 로그아웃 요청 처리 완료");

  }
}

//public void deleteAllCookies(HttpServletResponse response) {
//  // 쿠키 이름을 배열로 설정하여 모든 쿠키를 삭제합니다.
//  Cookie[] cookies = request.getCookies();
//  if (cookies != null) {
//    for (Cookie cookie : cookies) {
//      cookie.setValue(null); // 쿠키 값을 null로 설정
//      cookie.setMaxAge(0); // 쿠키 만료 시간 설정 (0초로 설정)
//      cookie.setPath("/"); // 쿠키의 path를 /로 설정하여 모든 경로에서 접근 가능하게 설정
//      response.addCookie(cookie); // 만료된 쿠키를 응답에 추가
//    }
//  }
//}
