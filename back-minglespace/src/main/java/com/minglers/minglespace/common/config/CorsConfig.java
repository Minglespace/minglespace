package com.minglers.minglespace.common.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Log4j2
@Configuration
public class CorsConfig implements WebMvcConfigurer {

//    @Override
//    public void addFormatters(FormatterRegistry registry) {
//        registry.addFormatter(new LocalDateFormatter());
//    }
    @Override
    public void addCorsMappings(CorsRegistry registry) {

//        registry.addMapping("/**")
//
//
//                .allowedOrigins("http://localhost:3000", "http://localhost:3001")  // 필요한 도메인만 허용
//
//                .allowedMethods("HEAD","GET","POST","DELETE","PUT")
//                .maxAge(300)
//                .allowedHeaders("Authorization", "Cache-Control", "Content-Type");
    }
}
