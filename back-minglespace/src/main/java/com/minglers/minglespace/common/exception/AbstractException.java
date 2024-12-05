package com.minglers.minglespace.common.exception;

public abstract class AbstractException extends RuntimeException{
  abstract public int getStatusCode();
  abstract public String getMessage();

  public AbstractException(String message){
    super(message);
  }
}
