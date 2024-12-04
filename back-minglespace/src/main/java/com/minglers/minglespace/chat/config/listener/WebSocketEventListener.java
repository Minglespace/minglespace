package com.minglers.minglespace.chat.config.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
//    private final Map<String, String> userSessions = new ConcurrentHashMap<>(); // 사용자별 세션 ID 저장

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event){
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String sessionId = accessor.getSessionId();
        System.out.println("새로운 웹 소켓 연결 - 세션 id : "+ sessionId);

//        String username = (String)accessor.getSessionAttributes().get("username");
//        System.out.println("사용자 연결됨: "+username);
//        if (username != null) {
//            userSessions.put(username, sessionId); // 사용자 이름과 세션 ID를 매핑
//            System.out.println("저장된 세션 ID: " + sessionId);
//        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event){
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String sessionId = accessor.getSessionId();
        System.out.println("웹소켓 연결 종료 세션id : "+ sessionId);

//        String username = (String)accessor.getSessionAttributes().get("username");
//        System.out.println("사용자 연결 종료 : "+username);
//        if (username != null) {
//            userSessions.remove(username);
//        }
    }

    // 사용자 이름과 세션 ID로 세션 조회
//    public String getSessionIdForUser(String username) {
//        return userSessions.get(username);
//    }
}
