package com.minglers.minglespace.common.config;

import com.minglers.minglespace.common.util.MsConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class CorsMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(MsConfig.getClientUrl())  // React 앱의 URL
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")  // 요청 헤더에 Authorization 허용
                .exposedHeaders("Authorization")  // 응답 헤더에서 Authorization을 클라이언트에 노출
                .allowCredentials(true);  // 쿠키와 인증 헤더를 허용
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // API 요청은 Spring으로 전달
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }

                        // 정적 파일이 존재하면 해당 파일 반환
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // 그 외 모든 경우 (React 라우팅) index.html로 포워딩
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
