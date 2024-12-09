package com.minglers.minglespace.todo.exception;
import com.minglers.minglespace.common.exception.AbstractException;

public class TodoException extends AbstractException {
  private final int errorCode;
  private final String errorMessage;
  public TodoException(int errorCode, String message){
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
