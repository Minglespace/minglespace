package com.minglers.minglespace.common.config;

import com.minglers.minglespace.common.util.Info;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**")
                .allowedOrigins(Info.CLIENT_URL)  // React 앱의 URL
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")  // 요청 헤더에 Authorization 허용
                .exposedHeaders("Authorization")  // 응답 헤더에서 Authorization을 클라이언트에 노출
                .allowCredentials(true);  // 쿠키와 인증 헤더를 허용
    }
}
