package com.minglers.minglespace.chat.config.listener;

import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

//연결 및 해제 집중
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
  private final StompInterceptor stompInterceptor;

  @EventListener
  public void handleWebSocketConnectListener(SessionConnectEvent event){
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

    String sessionId = accessor.getSessionId();
    System.out.println("new websocket connect - connectSession id : "+ sessionId);

    Long userId = (Long) accessor.getSessionAttributes().get("userId");
    if (userId != null){
      System.out.println("websocket connect userId : "+userId);
    }

  }

  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event){
    String sessionId = event.getSessionId();

    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

    System.out.println("websocket disconnected session id : "+ sessionId);

    Long userId = (Long) accessor.getSessionAttributes().get("userId");
    if (userId != null) {
      System.out.println("websocket disconnected : userId = " + userId);
//      stompInterceptor.removeSession(userId, sessionId);
    }
  }


}
