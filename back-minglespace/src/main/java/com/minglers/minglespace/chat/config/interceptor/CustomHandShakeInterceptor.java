package com.minglers.minglespace.chat.config.interceptor;

import com.minglers.minglespace.auth.security.JWTUtils;
import lombok.RequiredArgsConstructor;
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
        if (token != null && token.startsWith("Bearer ")){
            token = token.substring(7);

            Long userId = jwtUtils.extractUserId(token);

            if (userId != null){
                attributes.put("userId", userId);
                //userId와 연결 session 매핑
                userSessions.put(userId, attributes.get("sessionId").toString());
            }
        }

        return true; //websocket 연결 허용
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {

    }

    public String getSessionForUser(Long userId){
        return userSessions.get(userId);
    }

    public void removeSession(Long userId){
        userSessions.remove(userId);
    }
}
