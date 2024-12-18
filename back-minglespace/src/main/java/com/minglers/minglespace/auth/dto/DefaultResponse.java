package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.common.apitype.MsStatus;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class DefaultResponse {

  private MsStatus msStatus;

  public DefaultResponse(){
  }

  public DefaultResponse(MsStatus msStatus){
    setStatus(msStatus, "");
  }

  public DefaultResponse(MsStatus msStatus, String msg){
    setStatus(msStatus, msg);
  }

  public DefaultResponse setStatus(MsStatus msStatus) {
    return setStatus(msStatus, "");
  }

  public DefaultResponse setStatus(MsStatus msStatus, String msg){
    this.msStatus = msStatus;

    StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();

    if (stackTrace.length > 3) {
      StackTraceElement caller = stackTrace[3];
      log.info("{} .{}() - {} Line", caller.getClassName(), caller.getMethodName(), caller.getLineNumber());
      log.info("{}, {}, {}", msStatus, msStatus.getDesc(), msg);
    }

    return this;
  }

  public boolean equals(MsStatus msStatus) {
    return (this.msStatus == msStatus);
  }
}
