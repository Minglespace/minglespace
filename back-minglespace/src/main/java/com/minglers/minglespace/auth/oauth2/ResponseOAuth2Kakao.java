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
    Map<String, Object> kakaoAccount = (Map<String, Object>) attribute.get("kakao_account");
    if (kakaoAccount != null && kakaoAccount.containsKey("email")) {
      return kakaoAccount.get("email") != null ? kakaoAccount.get("email").toString() : "";
    }
    return "";
  }

  @Override
  public String getName() {
    Map<String, Object> kakaoAccount = (Map<String, Object>) attribute.get("kakao_account");
    if (kakaoAccount != null) {
      Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
      if (profile != null && profile.containsKey("nickname")) {
        return profile.get("nickname") != null ? profile.get("nickname").toString() : "";
      }
    }
    return "";
  }

  @Override
  public String getPhone() {
    Map<String, Object> kakaoAccount = (Map<String, Object>) attribute.get("kakao_account");
    if (kakaoAccount != null && kakaoAccount.containsKey("mobile")) {
      return kakaoAccount.get("mobile") != null ? kakaoAccount.get("mobile").toString() : "010";
    }
    return "010"; // 기본값
  }
}