package com.minglers.minglespace.auth.controller;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.AuthEmailService;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserService;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequiredArgsConstructor
class AuthController {

    private final UserService usersManagementService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JWTUtils jwtUtils;
    private final AuthEmailService authEmailService;
    private final ImageService imageService;
    private final ModelMapper modelMapper;

    @PostMapping("/auth/signup")
    public ResponseEntity<DefaultResponse> signup(@RequestBody SignupRequest reg, HttpServletRequest request) throws MessagingException {

        // 이메일 인증 코드 생성
        String code = UUID.randomUUID().toString();

        // 유저에 세팅
        reg.setVerificationCode(code);

        // 회원가입 서비스 진행
        DefaultResponse res = usersManagementService.signup(reg);

        if(res.getCode() == HttpStatus.OK.value()){
            log.info("비동기 이메일 전송 - Before");
            CompletableFuture<String> emailResult = authEmailService.sendEmail(code, reg.getEmail(), request);
            // 비동기 작업이 완료된 후 결과를 기다림
            emailResult.thenAccept(result -> {
                log.info("비동기 이메일 전송 결과: {}", result);
            });
            log.info("비동기 이메일 전송 - After : {}", emailResult.toString());
        }

        return ResponseEntity.ok(res);
    }

    @GetMapping("/auth/verify/{code}/{encodedEmail}")
    public ResponseEntity<DefaultResponse> verifyEmail(
            @PathVariable String code,
            @PathVariable String encodedEmail) {
        DefaultResponse res = authEmailService.verify(code, encodedEmail);

        log.info("verifyEmail res : {}", res);

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


    @PutMapping("/auth/update")
    public ResponseEntity<DefaultResponse> updateUser(
            @RequestBody UserUpdateRequest req,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Image saveFile = null;
        if(image != null){
            try{
                saveFile = imageService.uploadImage(image);
            }catch (RuntimeException | IOException e) {
                log.error("Image upload failed: " + e.getMessage(), e);
                throw new RuntimeException("이미지 업로드 실패 : ", e);
            }
        }

        User updateUser = new User();

        modelMapper.map(req, updateUser);

        updateUser.setImage(saveFile);

        DefaultResponse res = usersManagementService.updateUser(updateUser);

        return ResponseEntity.ok(res);
    }

    @PutMapping("/auth/update/{userId}")
    public ResponseEntity<DefaultResponse> updateUserById(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequest req,
            @RequestPart("image")MultipartFile image) {

        Image saveFile = null;
//        try{
//            saveFile = imageService.uploadImage(image);
//        }catch (RuntimeException | IOException e) {
//            log.error("Image upload failed: " + e.getMessage(), e);
//            throw new RuntimeException("채팅방 이미지 업로드 실패 : ", e);  // 업로드 실패 시 처리
//        }


        User updateUser = new User();

        modelMapper.map(req, updateUser);

        updateUser.setImage(saveFile);

        DefaultResponse res = usersManagementService.updateUser(userId, updateUser);

        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/auth/delete/{userId}")
    public ResponseEntity<DefaultResponse> deleteUSer(@PathVariable Long userId) {
        return ResponseEntity.ok(usersManagementService.deleteUser(userId));
    }

}
