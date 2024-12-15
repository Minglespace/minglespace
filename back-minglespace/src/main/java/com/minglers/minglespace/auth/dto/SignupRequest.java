package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SignupRequest implements Serializable {

  @NotNull(message = "이메일을 입력하세요.")
  @Email(message = "이메일 형식을 맞추세요.")
  private String email;

  @NotNull(message = "비밀번호을 입력하세요.")
  @Size(min = 8, message = "최소 8자 이상이어야 합니다.")
  private String password;

  @NotNull(message = "비밀번호 확인을 입력하세요.")
  @Size(min = 8, message = "최소 8자 이상이어야 합니다.")
  private String confirmPassword;

  @NotNull(message = "이름을 입력하세요.")
  @Size(min = 2, message = "최소  이상이어야 합니다.")
  private String name;

  @NotNull(message = "전화번호를 입력하세요.")
  @Pattern(regexp = "^[0-9]{10,11}$", message = "전화번호 형식을 맞추세요.")
  private String phone;

  @Size(max = 30, message = "최대 30자까지 지원합니다.")
  private String position;

  @Size(max = 100, message = "최대 100자까지 지원합니다.")
  private String introduction;

  // 에러 때문에 넣어둠.
  private String role;
  private String verificationCode;

  public boolean isPasswordMatching() {
    return this.password != null && this.password.equals(this.confirmPassword);
  }

  public String validation(){
    if(email == null || email.isEmpty() || email.isBlank())
      return "이메일 입력을 확인하세요.";

    if(password == null || password.isEmpty() || password.isBlank())
      return "비밀번호 입력을 확인하세요.";

    if(confirmPassword == null || confirmPassword.isEmpty() || confirmPassword.isBlank())
      return "비밀번호 확인 입력을 확인하세요.";

    if(name == null || name.isEmpty() || name.isBlank())
      return "이름 입력을 확인하세요.";

    if(phone == null || phone.isEmpty() || phone.isBlank())
      return "전화번호 입력을 확인하세요.";

    if(position == null || position.isEmpty() || position.isBlank())
      return "직급 입력을 확인하세요.";

    if(introduction == null || introduction.isEmpty() || introduction.isBlank())
      return "소개 입력을 확인하세요.";

    return null;
  }
}