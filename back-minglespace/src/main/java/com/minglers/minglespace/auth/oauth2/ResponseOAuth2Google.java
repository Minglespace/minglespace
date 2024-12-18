package com.minglers.minglespace.auth.oauth2;

import java.util.Map;

public class ResponseOAuth2Google implements ResponseOAuth2 {

  private final Map<String, Object> attribute;

  public ResponseOAuth2Google(Map<String, Object> attribute){

    this.attribute = attribute;
  }

  @Override
  public String getProvider() {
    return "google";
  }

  @Override
  public String getProviderId() {
    return attribute.get("sub") != null ? attribute.get("sub").toString() : "";
  }

  @Override
  public String getEmail() {
    return attribute.get("email") != null ? attribute.get("email").toString() : "";
  }

  @Override
  public String getName() {
    String name = attribute.get("name") != null ? attribute.get("name").toString() : "";
    String givenName = attribute.get("given_name") != null ? attribute.get("given_name").toString() : "";
    return name + " " + givenName;
  }

  @Override
  public String getPhone() {
    return attribute.get("mobile") != null ? attribute.get("mobile").toString() : "010";
  }
}
