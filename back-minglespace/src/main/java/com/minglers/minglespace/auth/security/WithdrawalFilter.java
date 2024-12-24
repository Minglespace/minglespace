package com.minglers.minglespace.auth.security;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.Withdrawal;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.VerifyType;
import com.minglers.minglespace.auth.type.WithdrawalType;
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
import java.util.Optional;

@Log4j2
@RequiredArgsConstructor
@Component
public class WithdrawalFilter extends OncePerRequestFilter {

  private final UserRepository userRepository;

  @Override
  protected void doFilterInternal(
          HttpServletRequest request,
          HttpServletResponse response,
          FilterChain filterChain) throws ServletException, IOException {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication != null && authentication.isAuthenticated()) {

      String email = authentication.getName();
      Optional<User> opt = userRepository.findByEmail(email);

//      if(opt.isPresent()){
//        User user = opt.get();
//        switch (user.getWithdrawalType()){
//          case ABLE:
//          case DELIVERATION:{
//            log.info("[MIRO] WithdrawalFilter 돌려 보내는 사유 : {}", user.getWithdrawalType().toString());
//            String url = MsConfig.getClientUrl("/auth/withdrawal");
//            log.info("[MIRO] url : {}", url);
////            response.sendRedirect(url);
//            response.sendRedirect(MsConfig.getClientUrl("/auth/signup"));
//          }break;
//        }
//      }
    }

    filterChain.doFilter(request, response);
  }
}
