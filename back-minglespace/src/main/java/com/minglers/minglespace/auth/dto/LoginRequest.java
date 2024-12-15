package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class LoginRequest {

  private String email;
  private String password;

  public String validation(){
    if(email == null || email.isEmpty() || email.isBlank())
      return "이메일 입력을 확인하세요.";

    if(password == null || password.isEmpty() || password.isBlank())
      return "비밀번호 입력을 확인하세요.";

    return null;
  }
}


