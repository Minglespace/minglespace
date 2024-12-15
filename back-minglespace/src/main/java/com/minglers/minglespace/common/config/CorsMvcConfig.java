package com.minglers.minglespace.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**")
                .exposedHeaders("Set-Cooke")
                .allowedOrigins("http://localhost:3000")
                .allowCredentials(true)
        ;
    }
}
