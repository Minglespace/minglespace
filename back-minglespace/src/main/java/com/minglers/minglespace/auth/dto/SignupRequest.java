package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SignupRequest {

  String email;
  String password;
  String name;
  String phone;
  String position;
  String introduction;
  String role;

  String confirmPassword;
  String verificationCode;
  boolean inviteWorkspace;
}
