package com.minglers.minglespace.auth.oauth2;

import com.minglers.minglespace.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

@RequiredArgsConstructor
public class OAuth2UserMs implements OAuth2User {

    private final User user;

    public User getUser(){return user;}

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add(new GrantedAuthority() {
            @Override
            public String getAuthority() {
                return user.getRole();
            }
        });
        return collection;
    }

    @Override
    public String getName() {
        return user.getName();
    }

    public String getUsername(){
        return user.getUsername();
    }

    public String getEmail(){
        return user.getEmail();
    }
}




