package com.minglers.minglespace.chat.config.interceptor;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.chat.exception.ChatException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class CustomHandShakeInterceptor implements HandshakeInterceptor {
  private final JWTUtils jwtUtils;
  private static final Map<Long, String> userSessions = new ConcurrentHashMap<>();

  @Override
  public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String token = request.getHeaders().getFirst("Authorization");
//    String token = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
//    String token = request.getURI().getQuery().replace("token=","");
    System.out.println("websocket_handshake_token: " + token);
    System.out.println("websocket_handshake_getHeaders: " + request.getHeaders());

    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);

      try {
        //jwt 검증
        Long userId = jwtUtils.extractUserId(token);
        if (userId != null ) { //&& jwtUtils.isTokenValid()
          attributes.put("userId", userId);
          //userId와 연결 session 매핑
          userSessions.put(userId, attributes.get("sessionId").toString());

          return true;
        }
      }catch (Exception e){
        throw new ChatException(HttpStatus.BAD_REQUEST.value(), "웹소켓 연결 시 오류 발생 _ 토큰 오류");
//        return  false;
      }
    }

    return false; //websocket 연결 허용
  }

  @Override
  public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {

  }

  public String getSessionForUser(Long userId) {
    return userSessions.get(userId);
  }

  public void removeSession(Long userId) {
    userSessions.remove(userId);
  }
}
