package com.minglers.minglespace.chat.config.interceptor;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.chat.exception.ChatException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class StompInterceptor implements ChannelInterceptor{
  private final JWTUtils jwtUtils;
  private final SimpMessagingTemplate simpMessagingTemplate;
  private final Map<Long, String> userSessions = new HashMap<>();

  @Autowired
  public StompInterceptor(JWTUtils jwtUtils, SimpMessagingTemplate simpMessagingTemplate) {
    this.jwtUtils = jwtUtils;
    this.simpMessagingTemplate = simpMessagingTemplate;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel){
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
    String token = accessor.getFirstNativeHeader("Authorization");

    System.out.println("message: "+message);
    System.out.println("header; "+message.getHeaders());
    System.out.println("websocket _ token : "+ accessor.getNativeHeader("Authorization"));

    if (StompCommand.CONNECT.equals(accessor.getCommand()) && token != null){
      token = token.substring(7);
      try{
        Long userId = jwtUtils.extractUserId(token);

        String sessionId = accessor.getSessionId();
        userSessions.put(userId,sessionId);

        accessor.getSessionAttributes().put("userId", userId);

        System.out.println("websocket _ connect userId: "+ userId);
//        Authentication authentication = new UsernamePasswordAuthenticationToken(userId.toString(), null);
//        accessor.setUser(authentication);

      }catch (Exception e){
        throw new ChatException(HttpStatus.BAD_REQUEST.value(), "웹소켓 연결 시 토큰 오류 발생");
      }
      ///token 유효한지 검사 필요한가
//      UserDetails user
//      jwtUtils.isTokenValid(accessor.getFirstNativeHeader("Authorization").substring(7), user)
    }
    return message;
  }


  public void sendMessageToUser(Long userId, String message) {
    String sessionId = userSessions.get(userId);
    if (sessionId != null) {
      simpMessagingTemplate.convertAndSendToUser(sessionId, "/queue/messages", message);
    }
  }

  public String getSessionForUser(Long userId) {
    return userSessions.get(userId);
  }

  public void addSession(Long userId, String sessionId) {
    userSessions.put(userId, sessionId);
  }

  public void removeSession(Long userId) {
    userSessions.remove(userId);
  }

}
