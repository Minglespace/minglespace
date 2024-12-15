package com.minglers.minglespace.auth.oauth2;

import java.util.Map;

public class ResponseOAuth2Kakao implements ResponseOAuth2 {

    private final Map<String, Object> attribute;

    public ResponseOAuth2Kakao(Map<String, Object> attribute){

        this.attribute = attribute;
    }

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getProviderId() {
        return attribute.get("id") != null ? attribute.get("id").toString() : "";
    }

    @Override
    public String getEmail() {
        return attribute.get("email") != null ? attribute.get("email").toString() : "";
    }

    @Override
    public String getName() {
        return attribute.get("name") != null ? attribute.get("name").toString() : "";
    }

    @Override
    public String getPhone() {
        return attribute.get("mobile") != null ? attribute.get("mobile").toString() : "010";
    }

}
