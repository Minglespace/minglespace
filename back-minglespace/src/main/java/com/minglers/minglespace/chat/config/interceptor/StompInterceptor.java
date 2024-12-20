package com.minglers.minglespace.chat.config.interceptor;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.chat.exception.ChatException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;


@Component
public class StompInterceptor implements ChannelInterceptor {
  private final JWTUtils jwtUtils;
  private final SimpMessagingTemplate simpMessagingTemplate;
  private final UserDetailsService userDetailsService;
  private final Map<Long, Set<String>> userSessions = new HashMap<>();
  private final Map<Long, Set<String>> userSubscriptions = new HashMap<>();

  @Autowired
  public StompInterceptor(JWTUtils jwtUtils,
                          SimpMessagingTemplate simpMessagingTemplate,
                          UserDetailsService userDetailsService) {
    this.jwtUtils = jwtUtils;
    this.simpMessagingTemplate = simpMessagingTemplate;
    this.userDetailsService =userDetailsService;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
    String token = accessor.getFirstNativeHeader("Authorization");

    if (StompCommand.CONNECT.equals(accessor.getCommand()) && token != null) {
      token = token.substring(7);
      System.out.println("웹소켓 연결 요청한 유저의 토큰: " + token);
      try {
        Long userId = jwtUtils.extractUserId(token);
        String sessionId = accessor.getSessionId();
        UserDetails userDetails = userDetailsService.loadUserByUsername(jwtUtils.extractUsername(token));

        if(jwtUtils.isTokenValid(token, userDetails)){
//          UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userId.toString(), null, userDetails.getAuthorities());
//          SecurityContextHolder.getContext().setAuthentication(authenticationToken);
//          accessor.setUser(authenticationToken);

          userSessions.computeIfAbsent(userId, k -> new HashSet<>()).add(sessionId);
          accessor.getSessionAttributes().put("userId", userId);
          System.out.println("websocket _ connect userId: " + userId);
        }
      } catch (Exception e) {
        throw new ChatException(HttpStatus.BAD_REQUEST.value(), "웹소켓 연결 시 토큰 오류 발생");
      }
    }else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())){
      Long userId = (Long) accessor.getSessionAttributes().get("userId");
      String destination = accessor.getDestination();

      if (userId != null && destination != null){
        userSubscriptions.computeIfAbsent(userId, k -> new HashSet<>()).add(destination);
        System.out.println("websocket _ subscribe userId: " + userId + ", destination: " + destination);
      }
    }else if(StompCommand.UNSUBSCRIBE.equals(accessor.getCommand())){
      Long userId = (Long) accessor.getSessionAttributes().get("userId");
      String destination = accessor.getDestination();

      if(userId != null && destination != null){
        Set<String> subscriptions = userSubscriptions.get(userId);
        if (subscriptions != null){
          subscriptions.remove(destination);
          if (subscriptions.isEmpty()){
            userSubscriptions.remove(userId);
          }
        }
        System.out.println("websocket _ unsubscribe userId: " + userId + ", destination: " + destination);
      }
    }else if (StompCommand.DISCONNECT.equals(accessor.getCommand())){
      Long userId = (Long) accessor.getSessionAttributes().get("userId");
      String sessionId = accessor.getSessionId();

      if (userId != null && sessionId != null){
        removeSession(userId, sessionId);
        userSubscriptions.remove(userId);
        System.out.println("websocket _ disconnect userId: " + userId + ", sessionId: " + sessionId);
      }
    }
    return message;
  }

  //나중에 common에 알림 관련 클래스 생기면 거기로 가자.
  public void sendMessageToUser(Long userId, String message) {
    Set<String> sessions = userSessions.get(userId);
    if (sessions != null) {
      sessions.forEach(sessionId -> simpMessagingTemplate.convertAndSendToUser(sessionId, "/queue/messages", message));
    }
  }

  public Set<String> getSessionForUser(Long userId) {
    return userSessions.get(userId);
  }

  public void removeSession(Long userId, String sessionId) {
    Set<String> sessionIds = userSessions.get(userId);
    if (sessionIds != null) {
      sessionIds.remove(sessionId);
      if (sessionIds.isEmpty()) {
        userSessions.remove(userId);
      }
    }
    userSubscriptions.remove(userId);
  }

  //경로를 구독중인 유저들의 id 추출
  public Set<Long> getActiveUsersForSubscription(String destination){
    //entrySet > 키-값 쌍 객체로 getKey, getValue함수를 포함.
    return userSubscriptions.entrySet().stream()
            .filter(entry -> entry.getValue().contains(destination))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
  }

}


