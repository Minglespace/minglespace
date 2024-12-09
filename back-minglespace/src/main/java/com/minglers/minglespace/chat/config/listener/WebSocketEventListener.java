package com.minglers.minglespace.chat.config.listener;

import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final CustomHandShakeInterceptor customHandShakeInterceptor;

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
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String sessionId = accessor.getSessionId();
        System.out.println("websocket disconnected session id : "+ sessionId);

        Long userId = (Long) accessor.getSessionAttributes().get("userId");
        if (userId != null) {
            System.out.println("websocket disconnected : userId = " + userId);
            customHandShakeInterceptor.removeSession(userId);
        }
    }


}
