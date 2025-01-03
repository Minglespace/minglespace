package com.minglers.minglespace.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.Withdrawal;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.VerifyType;
import com.minglers.minglespace.auth.type.WithdrawalType;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.util.MsConfig;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Log4j2
@RequiredArgsConstructor
@Component
public class WithdrawalFilter extends OncePerRequestFilter {

  private final UserRepository userRepository;

  // 검사대상 제외 URL 목록
  String[] checkUrlList = {
          "/api/auth/logout",
          "/api/auth/verify",
          "/api/auth/withdrawal/",
  };

  @Override
  protected void doFilterInternal(
          HttpServletRequest request,
          HttpServletResponse response,
          FilterChain filterChain) throws ServletException, IOException {

    // 요청 URL 가져오기
    String requestUri = request.getRequestURI();

    // checkUrlList에 포함된 URL이 아닌 경우 검사
    boolean isExcludedUrl = Arrays.stream(checkUrlList).anyMatch(requestUri::startsWith);

    if(!isExcludedUrl){
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication != null && authentication.isAuthenticated()) {

        String email = authentication.getName();
        Optional<User> opt = userRepository.findByEmail(email);

        if (opt.isPresent()) {
          log.info("[MIRO] WithdrawalFilter {}는 검사 대상이에요~", request.getRequestURI());

          AuthStatus authStatus = AuthStatus.Ok;
          User user = opt.get();
          switch (user.getWithdrawalType()) {
            case EMAIL: authStatus = AuthStatus.WithdrawalEmailFirst; break;
            case ABLE: authStatus = AuthStatus.WithdrawalAble; break;
            case DELIVERATION: authStatus = AuthStatus.WithdrawalDeliveration; break;
            default:
              log.info("[MIRO] 통과~");
              break;
          }
          if (authStatus != AuthStatus.Ok) {
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonResponse = objectMapper.writeValueAsString(new DefaultResponse(authStatus));
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.getWriter().write(jsonResponse);
            log.info("[MIRO] WithdrawalFilter 걸림 : {}, {}", authStatus, authStatus.getDesc());
            return;
          }
        }
      }
    }

    filterChain.doFilter(request, response);
  }
}
