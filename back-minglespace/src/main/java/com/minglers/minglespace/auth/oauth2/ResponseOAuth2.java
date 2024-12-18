package com.minglers.minglespace.auth.oauth2;

public interface ResponseOAuth2 {

  String getProvider();
  String getProviderId();
  String getEmail();
  String getName();
  String getPhone();
}
