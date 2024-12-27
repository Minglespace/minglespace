package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.auth.type.VerifyType;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmailVerifyResponse extends DefaultResponse {

  private VerifyType verifyType;

  public EmailVerifyResponse(){
    super();
  }
  public EmailVerifyResponse(AuthStatus authStatus){
    super(authStatus);
  }

}

