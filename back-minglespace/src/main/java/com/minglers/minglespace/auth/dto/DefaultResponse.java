package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.common.apitype.MsStatus;
import lombok.Data;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;

@Log4j2
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class DefaultResponse {

//  private int code;
//  private String msg;
//  private String error;
  private MsStatus msStatus;

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

  public boolean equals(MsStatus msStatus){
    return (this.msStatus == msStatus);
  }
}
