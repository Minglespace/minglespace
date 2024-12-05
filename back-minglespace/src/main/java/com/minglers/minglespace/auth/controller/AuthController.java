package com.minglers.minglespace.auth.controller;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserService;
import com.minglers.minglespace.common.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
class AuthController {

    private final UserService usersManagementService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JWTUtils jwtUtils;
    private final EmailService emailService;

    @PostMapping("/auth/signup")
    public ResponseEntity<DefaultResponse> signup(@RequestBody SignupRequest reg) {

        DefaultResponse res = usersManagementService.signup(reg);

        if(res.getCode() == HttpStatus.OK.value()){
            // 이메일 인증 링크 발송
            String token = UUID.randomUUID().toString();
            String confirmationUrl = "http://localhost:8081/auth/confirm?token=" + token;
            String emailContent = "이메일 인증을 완료하려면 아래 링크를 클릭하세요:\n" + confirmationUrl;

            emailService.sendEmail(reg.getEmail(), "이메일 인증", emailContent);
        }

        return ResponseEntity.ok(res);
    }

    @GetMapping("/auth/confirm")
    public ResponseEntity<DefaultResponse> confirmEmail(@RequestParam String token) {

        // 토큰을 확인하고,
        // 사용자의 이메일을 인증 처리
        // (실제 구현에서는 토큰을 DB에 저장하여 확인하는 방식이 필요)
        log.info("confirmEmail token : {}", token);

        DefaultResponse res = new DefaultResponse();

        res.setStatus(HttpStatus.OK);
        res.setMsg("이메일 인증이 완료되었습니다.");

        return ResponseEntity.ok(res);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(usersManagementService.login(req));
    }

    @PostMapping("auth/logout")
    public ResponseEntity<DefaultResponse> logout(@RequestBody RefreshTokenRequest req){
        DefaultResponse res = new DefaultResponse();
        log.info("auth/logout");
        log.info("req : {}", req.toString());

        String refreshToken = req.getRefreshToken();

        LocalDateTime expiresAt = jwtUtils.extractExpiration(refreshToken);
        log.info("Token expires at: {}", expiresAt);

        tokenBlacklistService.addToBlacklist(refreshToken, expiresAt);

        res.setCode(200);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(usersManagementService.refreshToken(req));
    }

    @GetMapping("/auth/user")
    public ResponseEntity<UserResponse> getMyProfile() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();
        UserResponse response = usersManagementService.getUserByEmail(email);

        return ResponseEntity.status(response.getCode()).body(response);
    }

    @GetMapping("/auth/user/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(usersManagementService.getUserById(userId));
    }

    @PutMapping("/auth/update/{userId}")
    public ResponseEntity<DefaultResponse> updateUser(@PathVariable Long userId, @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(usersManagementService.updateUser(userId, req));
    }

    @DeleteMapping("/auth/delete/{userId}")
    public ResponseEntity<DefaultResponse> deleteUSer(@PathVariable Long userId) {
        return ResponseEntity.ok(usersManagementService.deleteUser(userId));
    }

}
