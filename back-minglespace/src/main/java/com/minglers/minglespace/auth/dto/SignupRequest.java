package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SignupRequest {

  @NotBlank(message = "SinupValideEmailEmpty")
  @Email(message = "SinupValideEmailWrong")
  String email;

  @NotBlank(message = "SinupValidePwWEmpty")
  @Size(min = 8, message = "SinupValidePwWLength")
  @Pattern(regexp = "(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).*", message = "SinupValidePwWrong")
  String password;

  @NotBlank(message = "SinupValideConfirmPwMismatch")
  String confirmPassword;

  @NotBlank(message = "SinupValideNameEmpty")
  String name;

  @NotBlank(message = "SinupValidePhoneEmpty")
  @Pattern(regexp = "^(01[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}|0[2-9]{1}[0-9]{1}-?[0-9]{3,4}-?[0-9]{4})$", message = "SinupValidePhoneWrong")
  String phone;

  String position;
  String introduction;
  String role;

  String verificationCode;
  boolean inviteWorkspace;
}
