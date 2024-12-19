package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class DefaultResponse {

  private AuthStatus msStatus;

  public DefaultResponse(){
  }

  public DefaultResponse(AuthStatus authStatus){
    setStatus(authStatus, "");
  }

  public DefaultResponse(AuthStatus authStatus, String msg){
    setStatus(authStatus, msg);
  }

  public DefaultResponse setStatus(AuthStatus authStatus) {
    return setStatus(authStatus, "");
  }

  public DefaultResponse setStatus(AuthStatus authStatus, String msg){
    this.msStatus = authStatus;

    StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();

    if (stackTrace.length > 3) {
      StackTraceElement caller = stackTrace[3];
      log.info("{} .{}() - {} Line", caller.getClassName(), caller.getMethodName(), caller.getLineNumber());
      log.info("{}, {}, {}", authStatus, authStatus.getDesc(), msg);
    }

    return this;
  }

  public boolean equals(AuthStatus authStatus) {
    return (this.msStatus == authStatus);
  }
}
