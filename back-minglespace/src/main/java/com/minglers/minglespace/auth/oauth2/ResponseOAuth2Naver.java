package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.type.Provider;

import java.util.Map;

public class ResponseOAuth2Naver implements ResponseOAuth2 {

  private final Map<String, Object> attribute;

  public ResponseOAuth2Naver(Map<String, Object> attribute){
    this.attribute = (Map<String, Object>) attribute.get("response");
  }

  @Override
  public Provider getProvider() {
    return Provider.NAVER;
  }

  @Override
  public String getProviderId() {
    return get("id");
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
    return get("profile_image");
  }

  private String get(String key){
    return attribute.get(key) != null ? attribute.get(key).toString() : "";

  }
}
