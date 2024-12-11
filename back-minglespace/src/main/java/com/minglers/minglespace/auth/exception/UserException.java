package com.minglers.minglespace.auth.exception;

import com.minglers.minglespace.common.exception.AbstractException;

public class UserException extends AbstractException {
  private final int errorCode;
  private final String errorMessage;
  public UserException(int errorCode, String message){
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
