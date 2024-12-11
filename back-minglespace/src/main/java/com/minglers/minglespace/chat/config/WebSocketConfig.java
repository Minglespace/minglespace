package com.minglers.minglespace.chat.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final StompInterceptor stompInterceptor;

    //순환 의존성 방지
    @Autowired
    public WebSocketConfig(@Lazy StompInterceptor stompInterceptor) {
        this.stompInterceptor = stompInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic","/queue"); // 클라이언트가 구독할 수 있는 메시지 브로커 경로 설정
        config.setApplicationDestinationPrefixes("/app"); // 클라이언트에서 메시지를 보낼 때 붙이는 경로
    }

    @Override //통신 시작점 정의
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // WebSocket 연결 엔드포인트
//                .setAllowedOriginPatterns("*") // CORS 설정. 이건 모든 도메인 허용
                .setAllowedOrigins("http://localhost:3000", "ws://localhost:3000") // CORS 설정. 이건 모든 도메인 허용
                .withSockJS()// SockJS 사용>websocket 지원 안하는 브라우저도 fallback기능 제공
                .setHeartbeatTime(4000);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration){
        registration.interceptors(stompInterceptor);
    }


}
