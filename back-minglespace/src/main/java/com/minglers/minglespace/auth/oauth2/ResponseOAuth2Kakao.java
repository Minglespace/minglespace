package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.type.Provider;

import java.util.Map;

public class ResponseOAuth2Kakao implements ResponseOAuth2 {

  private final Map<String, Object> attribute;

  public ResponseOAuth2Kakao(Map<String, Object> attribute) {
    this.attribute = attribute;
  }

  @Override
  public Provider getProvider() {
    return Provider.KAKAO;
  }

  @Override
  public String getProviderId() {
    return attribute.get("id") != null ? attribute.get("id").toString() : "";
  }

  @Override
  public String getEmail() {
    return getInAccount("email");
  }

  @Override
  public String getName() {
    return getInProfile("nickname");
  }

  @Override
  public String getPhone() {
    return getInAccount("mobile");
  }

  @Override
  public String getProfileImage() {
    return getInProfile("profile_image_url");
  }

  private String getInAccount(String key){
    Map<String, Object> kakaoAccount = (Map<String, Object>) attribute.get("kakao_account");
    if (kakaoAccount != null) {
      return kakaoAccount.get(key) != null ? kakaoAccount.get(key).toString() : "";
    }
    return "";
  }

  private String getInProfile(String key){
    Map<String, Object> kakaoAccount = (Map<String, Object>) attribute.get("kakao_account");
    if (kakaoAccount != null) {
      Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
      if (profile != null) {
        return profile.get(key) != null ? profile.get(key).toString() : "";
      }
    }
    return "";
  }
}