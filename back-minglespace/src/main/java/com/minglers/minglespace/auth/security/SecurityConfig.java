package com.minglers.minglespace.auth.security;

import com.minglers.minglespace.auth.exception.CustomAuthenticationEntryPoint;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
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
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JWTAuthFilter jwtAuthFilter;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final JWTUtils jwtUtils;
    private final AuthenticationConfiguration authenticationConfiguration;
    private final UserRepository userRepository;
    private final TokenBlacklistService tokenBlacklistService;

    // Filter용 Cors Setting
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration corsConfig = new CorsConfiguration();

        // 허용할 오리진
        corsConfig.addAllowedOrigin("http://localhost:3000");
        corsConfig.addAllowedOrigin("http://localhost:3001");

        // 메서드 허용
        corsConfig.addAllowedMethod("GET");
        corsConfig.addAllowedMethod("POST");
        corsConfig.addAllowedMethod("PUT");
        corsConfig.addAllowedMethod("DELETE");
        corsConfig.addAllowedMethod("OPTIONS");

        // 헤더 허용
        corsConfig.addAllowedHeader("Authorization");
        corsConfig.addAllowedHeader("Cache-Control");
        corsConfig.addAllowedHeader("Content-Type");

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

        // csrf disable
        http.csrf(CsrfConfigurer::disable);

        // From login disable
        http.formLogin(FormLoginConfigurer::disable);

        // disable
        http.httpBasic(HttpBasicConfigurer::disable);

        // cors setting
        http.cors(c->c.configurationSource(corsConfigurationSource()));

        // seesion STATELESS
        http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));


        // autho path
        http.authorizeHttpRequests(r -> r
                .requestMatchers("/auth/**", "/public/**","/upload/images/**","/ws/**").permitAll()
                .requestMatchers("/admin/**").hasAnyAuthority("ADMIN")
                .requestMatchers("/user/**").hasAnyAuthority("USER")
                .requestMatchers("/adminuser/**").hasAnyAuthority("ADMIN", "USER")
                .anyRequest().authenticated());


        // OAuth2
        // 우선 디폴트, 추후 변경
        http.oauth2Login(Customizer.withDefaults());

        // 
        http.authenticationProvider(authenticationProvider());

        // 기존
        {
            //http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }
        // 신규 MsLoginFilter, MsLogoutFilter 적용 버전
        {
            MsLoginFilter msLoginFilter = new MsLoginFilter(
                    authenticationManager(authenticationConfiguration),
                    jwtUtils,
                    userRepository);
            msLoginFilter.setFilterProcessesUrl("/auth/login");

            MsLogoutFilter msLogoutFilter = new MsLogoutFilter(
                    jwtUtils,
                    tokenBlacklistService);

//            http.addFilterBefore(new JWTAuthFilter(jwtUtils, userDetailsService), MsLoginFilter.class);
            http.addFilterBefore(jwtAuthFilter, MsLoginFilter.class);

            http.addFilterAt(msLoginFilter, UsernamePasswordAuthenticationFilter.class);
            http.addFilterBefore(msLogoutFilter, LogoutFilter.class);
        }


        http.exceptionHandling(c -> c.authenticationEntryPoint(customAuthenticationEntryPoint));

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
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
