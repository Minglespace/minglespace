package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.util.CookieManager;
import com.minglers.minglespace.common.util.MsConfig;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Log4j2
@RequiredArgsConstructor
@Component
public class SuccessHandlerOAuth2 extends SimpleUrlAuthenticationSuccessHandler {

  private final JWTUtils jwtUtils;

  @Override
  public void onAuthenticationSuccess(
          HttpServletRequest request,
          HttpServletResponse response,
          Authentication authentication) throws IOException {

    OAuth2UserMs oAuth2UserMs = (OAuth2UserMs) authentication.getPrincipal();

    if(oAuth2UserMs.getStatus() == AuthStatus.AlreadyJoinedEmail){
      log.info("[MIRO] 돌려 보내는 사유 : {}", oAuth2UserMs.getStatus().getDesc());
      response.sendRedirect(MsConfig.getClientUrl("/auth/login/" +  oAuth2UserMs.getStatus()));
      return;
    }

    User user = oAuth2UserMs.getUser();

    log.info("[MIRO] 로그인 성공, user : {}", user.getEmail());

    // 토큰 생성
    String accessToken = jwtUtils.geneTokenAccess(user);
    String refreshToken = jwtUtils.geneTokenRefresh(user);

    // accessToken은 소셜 로그인시 최초 1회는 쿠키에 넣어 준다
    CookieManager.add("Authorization", accessToken, JWTUtils.EXPIRATION_ACCESS, response);

    // refreshToken은 계속 쿠키에서 관리된다.
    CookieManager.add(JWTUtils.REFRESH_TOKEN, refreshToken, JWTUtils.EXPIRATION_REFRESH, response);

    // sendRedirect
    response.sendRedirect(MsConfig.getClientUrl("/auth/token"));
  }
}