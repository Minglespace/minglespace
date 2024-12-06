package com.minglers.minglespace.workspace.exception;

import com.minglers.minglespace.common.exception.AbstractException;
import org.springframework.http.HttpStatus;

public class WorkspaceException extends AbstractException {
  private final int errorCode;
  private final String errorMessage;
  public WorkspaceException(int errorCode, String message){
    super(message);
    this.errorMessage = message;
    this.errorCode = errorCode;
  }

  @Override
  public int getStatusCode() {
    return errorCode;
  }

  @Override
  public String getMessage() {
    return errorMessage;
  }
}
