package com.minglers.minglespace.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Controller용 Cors Setting
@Configuration
public class CorsMvcConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry corsRegistry) {

    corsRegistry.addMapping("/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:3001")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Authorization", "Cache-Control", "Content-Type")
            .maxAge(3600L)
            .allowCredentials(true);
  }
}