package com.minglers.minglespace.common.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MsConfig {

  private static String clientUrl;

  @Value("${msconfig.client.url}")
  private void setClientUrl(String clientUrl){
    MsConfig.clientUrl = clientUrl;
  }

  public static String getClientUrl() {return clientUrl;}
  public static String getClientUrl(String uri) {return clientUrl + uri;}

  public enum UriType{
    SIGNUP,
    WITHDRAWAL,
    MESSAGE,
  };

}
