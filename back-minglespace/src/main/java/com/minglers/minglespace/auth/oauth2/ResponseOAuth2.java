package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.type.Provider;

public interface ResponseOAuth2 {
  Provider getProvider();
  String getProviderId();
  String getEmail();
  String getName();
  String getPhone();
}
