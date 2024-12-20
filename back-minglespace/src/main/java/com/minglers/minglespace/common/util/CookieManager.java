package com.minglers.minglespace.common.util;

import com.minglers.minglespace.auth.security.JWTUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CookieManager {

  public static void add(String key, String value, Long expirationMill, HttpServletResponse response) {

    Cookie cookie = new Cookie(key, value);

    int expirationSec = (int)(expirationMill / 1000);
    cookie.setMaxAge(expirationSec);
    //cookie.setSecure(true);
    cookie.setPath("/");
    cookie.setHttpOnly(true);

    response.addCookie(cookie);
  }

  public static void clear(String key, HttpServletResponse response){
    Cookie cookie = new Cookie(key, null);
    cookie.setMaxAge(0);
    cookie.setPath("/");
    response.addCookie(cookie);
  }

  public static String get(String key, HttpServletRequest request){
    Cookie[] cookies = request.getCookies();
    if(cookies != null){
      for (Cookie cookie : cookies) {
        if (cookie.getName().equals(key)) {
          return cookie.getValue();
        }
      }
    }
    return null;
  }
}
