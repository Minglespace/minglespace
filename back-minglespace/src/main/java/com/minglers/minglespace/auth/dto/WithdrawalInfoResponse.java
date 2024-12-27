package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.auth.type.VerifyType;
import com.minglers.minglespace.auth.type.WithdrawalType;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class WithdrawalInfoResponse extends DefaultResponse {

  private String email;
  private String name;
  private WithdrawalType withdrawalType;
  private LocalDateTime expireDate;

  public WithdrawalInfoResponse(){
    super();
  }

  public WithdrawalInfoResponse(AuthStatus authStatus){
    super(authStatus);
  }

}

