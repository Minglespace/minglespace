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
import org.springframework.messaging.simp.user.SimpSession;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

//웹소켓 연결 세션 관리
//@Component
//public class StompInterceptor implements ChannelInterceptor {
//  private final JWTUtils jwtUtils;
//  private final SimpMessagingTemplate simpMessagingTemplate;
//  private final SimpUserRegistry simpUserRegistry;
//
//  @Autowired
//  public StompInterceptor(JWTUtils jwtUtils,
//                          SimpMessagingTemplate simpMessagingTemplate,
//                          SimpUserRegistry simpUserRegistry) {
//    this.jwtUtils = jwtUtils;
//    this.simpMessagingTemplate = simpMessagingTemplate;
//    this.simpUserRegistry = simpUserRegistry;
//  }
//
//  @Override
//  public Message<?> preSend(Message<?> message, MessageChannel channel) {
//    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
//    String token = accessor.getFirstNativeHeader("Authorization");
//
//    if (StompCommand.CONNECT.equals(accessor.getCommand()) && token != null) {
//      token = token.substring(7);
//      try {
//        Long userId = jwtUtils.extractUserId(token);
//        accessor.getSessionAttributes().put("userId", userId);
//
//        //인증객체 생성 및 세션에 설정
//        Authentication authentication = new UsernamePasswordAuthenticationToken(userId.toString(), null);
//        accessor.setUser(authentication);
//
//        System.out.println("websocket _ connect userId: " + userId);
//      } catch (Exception e) {
//        throw new ChatException(HttpStatus.BAD_REQUEST.value(), "웹소켓 연결 시 토큰 오류 발생");
//      }
//      ///token 유효한지 검사 필요한가
////      UserDetails user
////      jwtUtils.isTokenValid(accessor.getFirstNativeHeader("Authorization").substring(7), user)
//    }
//    return message;
//  }
//
//  public Set<Long> getActiveUsersForChatRoom(Long chatRoomId) {
//    return simpUserRegistry.getUsers().stream()
//            .flatMap(user -> user.getSessions().stream())
//            .filter(session -> session.getSubscriptions().stream()
//                    .anyMatch(sub -> sub.getDestination().equals("/topic/chatRooms/" + chatRoomId + "/msg")))
//            .map(session -> Long.parseLong(session.getUser().getName()))
//            .collect(Collectors.toSet());
//  }
//
//  //특정 유저에게 메시지 보낼 때
//  public void sendMessageToUser(Long userId, String message) {
//    Set<SimpSession> userSessions = simpUserRegistry.getUsers().stream()
//            .filter(user -> user.getName().equals(String.valueOf(userId)))
//            .flatMap(user -> user.getSessions().stream())
//            .collect(Collectors.toSet());
//
//    userSessions.forEach(session -> simpMessagingTemplate.convertAndSendToUser(session.getId(), "/queue/messages", message));
//  }
//}


@Component
public class StompInterceptor implements ChannelInterceptor {
  private final JWTUtils jwtUtils;
  private final SimpMessagingTemplate simpMessagingTemplate;
  private final Map<Long, Set<String>> userSessions = new HashMap<>();
  private final Map<Long, Set<String>> userSubscriptions = new HashMap<>();

  @Autowired
  public StompInterceptor(JWTUtils jwtUtils,
                          SimpMessagingTemplate simpMessagingTemplate) {
    this.jwtUtils = jwtUtils;
    this.simpMessagingTemplate = simpMessagingTemplate;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
    String token = accessor.getFirstNativeHeader("Authorization");

    if (StompCommand.CONNECT.equals(accessor.getCommand()) && token != null) {
      token = token.substring(7);
      try {
        Long userId = jwtUtils.extractUserId(token);
        String sessionId = accessor.getSessionId();

        userSessions.computeIfAbsent(userId, k -> new HashSet<>()).add(sessionId);
        accessor.getSessionAttributes().put("userId", userId);

        System.out.println("websocket _ connect userId: " + userId);
      } catch (Exception e) {
        throw new ChatException(HttpStatus.BAD_REQUEST.value(), "웹소켓 연결 시 토큰 오류 발생");
      }
      ///token 유효한지 검사 필요한가
//      UserDetails user
//      jwtUtils.isTokenValid(accessor.getFirstNativeHeader("Authorization").substring(7), user)
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


  public void sendMessageToUser(Long userId, String message) {
    Set<String> sessions = userSessions.get(userId);
    if (sessions != null) {
      sessions.forEach(sessionId -> simpMessagingTemplate.convertAndSendToUser(sessionId, "/queue/messages", message));
    }
  }

  public Set<String> getSessionForUser(Long userId) {
    return userSessions.get(userId);
  }

  public void addSession(Long userId, String sessionId) {
    userSessions.computeIfAbsent(userId, k -> new HashSet<>()).add(sessionId);
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

  public Set<Long> getActiveUsersForSubscription(String destination){
    //entrySet > 키-값 쌍 객체로 getKey, getValue함수를 포함.
    return userSubscriptions.entrySet().stream()
            .filter(entry -> entry.getValue().contains(destination))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
  }

}
