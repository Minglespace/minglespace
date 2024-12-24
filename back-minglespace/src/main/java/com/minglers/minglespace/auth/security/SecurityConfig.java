package com.minglers.minglespace.auth.security;

import com.minglers.minglespace.auth.exception.CustomAuthenticationEntryPoint;
import com.minglers.minglespace.auth.oauth2.SuccessHandlerOAuth2;
import com.minglers.minglespace.auth.oauth2.UserServiceOAuth2;
import com.minglers.minglespace.auth.service.UserDetailsServiceImpl;
import com.minglers.minglespace.common.util.MsConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.config.annotation.web.configurers.HttpBasicConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final UserDetailsServiceImpl ourUserDetailsService;
  private final JWTAuthFilter jwtAuthFilter;
  private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
  private final UserServiceOAuth2 userServiceOAuth2;
  private final SuccessHandlerOAuth2 successHandlerOAuth2;

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration corsConfig = new CorsConfiguration();

    // 허용할 오리진
    corsConfig.addAllowedOrigin(MsConfig.getClientUrl());

//        // 메서드 허용
//        corsConfig.addAllowedMethod("GET");
//        corsConfig.addAllowedMethod("POST");
//        corsConfig.addAllowedMethod("OPTIONS");
//        corsConfig.addAllowedMethod("DELETE");
//        corsConfig.addAllowedMethod("PUT");
//
//        // 헤더 허용
//        corsConfig.addAllowedHeader("Authorization");
//        corsConfig.addAllowedHeader("Set-Cookie");
//        corsConfig.addAllowedHeader("Cache-Control");
//        corsConfig.addAllowedHeader("Content-Type");

    corsConfig.addAllowedOriginPattern("*");	// 모든 IP에 응답을 허용 allowedOrigins true 일때 addAllowedOrigin *값 사용 불가능
    corsConfig.addAllowedMethod("*");			// 모든 HTTP METHOD 허용
    corsConfig.addAllowedHeader("*");			// 모든 HTTP HEADER 허용
    corsConfig.addExposedHeader("Authorization");
    corsConfig.addExposedHeader("authorization");



    // Preflight 캐시 타임
    corsConfig.setMaxAge(3600L);

    //websocket의 jwt를 받기 위한 자격 증명 요청 허용
    corsConfig.setAllowCredentials(true);


    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

    // 모든 경로에 CORS 설정 적용
    source.registerCorsConfiguration("/**", corsConfig);

    return source;



  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    http.csrf(CsrfConfigurer::disable);

    http.formLogin(FormLoginConfigurer::disable);

    http.httpBasic(HttpBasicConfigurer::disable);

    http.oauth2Login(o->o
            .userInfoEndpoint(c->c
                    .userService(userServiceOAuth2))
            .successHandler(successHandlerOAuth2)
    );


    http.cors(c->c.configurationSource(corsConfigurationSource()));

    http.authorizeHttpRequests(request -> request
            .requestMatchers("/auth/**", "/public/**","/upload/images/**","/ws/**").permitAll()
            .requestMatchers("/workspace/{workspaceId}/invite/{uuid}").permitAll()
            .requestMatchers("/admin/**").hasAnyAuthority("ADMIN")
            .requestMatchers("/user/**").hasAnyAuthority("USER")
            .requestMatchers("/adminuser/**").hasAnyAuthority("ADMIN", "USER")
            .anyRequest().authenticated());

    http.sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    http.authenticationProvider(authenticationProvider());

    http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    http.exceptionHandling(c -> c.authenticationEntryPoint(customAuthenticationEntryPoint));

    return http.build();
  }

  @Bean
  public AuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
    daoAuthenticationProvider.setUserDetailsService(ourUserDetailsService);
    daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
    return daoAuthenticationProvider;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
          throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }

}
