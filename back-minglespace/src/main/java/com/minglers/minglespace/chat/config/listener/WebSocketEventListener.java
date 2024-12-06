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
        System.out.println("새로운 웹 소켓 연결 - 세션 id : "+ sessionId);

        Long userId = (Long) accessor.getSessionAttributes().get("userId");
        if (userId != null){
            System.out.println("websocket 사용자 연결 : "+userId);
        }

    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event){
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String sessionId = accessor.getSessionId();
        System.out.println("웹소켓 연결 종료 세션id : "+ sessionId);

        Long userId = (Long) accessor.getSessionAttributes().get("userId");
        if (userId != null) {
            System.out.println("사용자 연결 종료: userId = " + userId);
            customHandShakeInterceptor.removeSession(userId);
        }
    }


}
