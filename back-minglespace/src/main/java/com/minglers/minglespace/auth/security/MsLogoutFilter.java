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

import java.io.IOException;
import java.time.LocalDateTime;

@Log4j2
@RequiredArgsConstructor
public class MsLogoutFilter extends GenericFilterBean {

  private final JWTUtils jwtUtils;
  private final TokenBlacklistService tokenBlacklistService;

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
    doFilter((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse, filterChain);
  }
  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException {


    String requestUri = request.getRequestURI();

    log.info("doFilter requestUri : {}",requestUri);

//    if (!requestUri.matches("^\\/auth\\/logout$")) {
    if (!requestUri.matches("/auth/logout")) {

      filterChain.doFilter(request, response);
      return;
    }
    String requestMethod = request.getMethod();
    if (!requestMethod.equals("POST")) {

      filterChain.doFilter(request, response);
      return;
    }



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

    //refresh null check
    if (refreshToken == null) {

      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    // 만료되었다고 로그아웃을 못해? 이상타~~
    // 그래서 주석 처리
    //expired check
//    try {
//      if(jwtUtils.isTokenExpired(refresh)){
//        //response status code
//        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
//        return;
//      }
//    } catch (ExpiredJwtException e) {
//
//      //response status code
//      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
//      return;
//    }

    // 토큰이 refresh인지 확인 (발급시 페이로드에 명시)
    if (!jwtUtils.isRefreshToken(refreshToken)) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }


    if(!tokenBlacklistService.isBlacklisted(refreshToken)){
      LocalDateTime expiresAt = jwtUtils.extractExpiration(refreshToken);
      tokenBlacklistService.addToBlacklist(refreshToken, expiresAt);
    }




    // for test
    {
      // 쿠키 이름을 배열로 설정하여 모든 쿠키를 삭제합니다.
      Cookie[] cookies2 = request.getCookies();
      if (cookies2 != null) {
        for (Cookie cookie2 : cookies2) {
          log.info("쿠키 삭제 : {}", cookie2.getName());
          cookie2.setValue(null); // 쿠키 값을 null로 설정
          cookie2.setMaxAge(0); // 쿠키 만료 시간 설정 (0초로 설정)
          cookie2.setPath("/"); // 쿠키의 path를 /로 설정하여 모든 경로에서 접근 가능하게 설정
          response.addCookie(cookie2); // 만료된 쿠키를 응답에 추가
        }
      }
    }


    //Refresh 토큰 Cookie 값 0
    Cookie cookie = new Cookie(JWTUtils.TOKEN_NAME_REFRESH, null);
    cookie.setMaxAge(0);
    cookie.setPath("/");
    response.addCookie(cookie);


    // for test
    {
      log.info("남아있는 쿠키 확인 : ");

      Cookie[] cookies3 = request.getCookies();
      for (Cookie cookie3 : cookies3) {

        log.info("cookie.getName() : {}", cookie.getName());
        log.info("cookie.getValue() : {}", cookie.getValue());

      }
    }

    response.setStatus(HttpServletResponse.SC_OK);
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
