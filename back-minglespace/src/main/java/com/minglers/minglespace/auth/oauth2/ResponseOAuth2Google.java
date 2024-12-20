package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.type.Provider;

import java.util.Map;

public class ResponseOAuth2Google implements ResponseOAuth2 {

  private final Map<String, Object> attribute;

  public ResponseOAuth2Google(Map<String, Object> attribute){

    this.attribute = attribute;
  }

  @Override
  public Provider getProvider() {
    return Provider.GOOGLE;
  }

  @Override
  public String getProviderId() {
    return get("sub");
  }

  @Override
  public String getEmail() {
    return get("email");
  }

  @Override
  public String getName() {
    return get("name");
  }

  @Override
  public String getPhone() {
    return get("mobile");
  }

  @Override
  public String getProfileImage() {
    return get("picture");
  }

  private String get(String key){
    return attribute.get(key) != null ? attribute.get(key).toString() : "";
  }
}
