package com.minglers.minglespace.auth.oauth2;

import java.util.Map;

public class ResponseOAuth2Naver implements ResponseOAuth2 {

    private final Map<String, Object> attribute;

    public ResponseOAuth2Naver(Map<String, Object> attribute){

//        this.attribute = attribute;
        this.attribute = (Map<String, Object>) attribute.get("response");
    }

    @Override
    public String getProvider() {
        return "naver";
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
