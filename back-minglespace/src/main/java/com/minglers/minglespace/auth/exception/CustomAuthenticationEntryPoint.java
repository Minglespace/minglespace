package com.minglers.minglespace.auth.exception;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;

@Slf4j
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

  @Override
  public void commence(
          HttpServletRequest request,
          HttpServletResponse response,
          AuthenticationException authException) throws IOException, ServletException {

    JwtExceptionCode exception = (JwtExceptionCode) request.getAttribute("exception");

    if(exception != null) {
      log.error("=====================================================");
      log.error("=====================================================");
      log.error("=====================================================");
      log.error("CustomAuthenticationEntryPoint");
      log.error("JwtExceptionCode : {}", exception);

      setResponse(response, exception);


    }
  }

  private void setResponse(HttpServletResponse response, JwtExceptionCode exceptionCode) throws IOException {

    response.setContentType("application/json;charset=UTF-8");
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

    HashMap<String, Object> errorInfo = new HashMap<>();

    errorInfo.put("message", exceptionCode.getMessage());
    errorInfo.put("code", exceptionCode.getCode());

    Gson gson = new Gson();
    String responseJson = gson.toJson(errorInfo);

    response.getWriter().print(responseJson);
  }
}
