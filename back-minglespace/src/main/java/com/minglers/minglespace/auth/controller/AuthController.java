package com.minglers.minglespace.auth.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.AuthEmailService;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserService;
import com.minglers.minglespace.chat.dto.ChatListResponseDTO;
import com.minglers.minglespace.chat.dto.CreateChatRoomRequestDTO;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import com.minglers.minglespace.workspace.entity.WSMember;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
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
    private final ObjectMapper objectMapper;

    @PostMapping("/auth/signup")
    public ResponseEntity<DefaultResponse> signup(
            @Valid
            @RequestBody SignupRequest reg,
            HttpServletRequest request) throws MessagingException {

        log.info("[MIRO] 회원가입 컨트롤 들어옴");

        // 이메일 인증 코드 생성
        String code = UUID.randomUUID().toString();

        // 유저에 세팅
        reg.setVerificationCode(code);

        // 회원가입 서비스 진행
        DefaultResponse res = usersManagementService.signup(reg);

        if(res.getCode() == HttpStatus.OK.value()){
            log.info("[MIRO] 비동기 이메일 전송 - Before");
            CompletableFuture<String> emailResult = authEmailService.sendEmail(code, reg.getEmail(), request);
            // 비동기 작업이 완료된 후 결과를 기다림
            emailResult.thenAccept(result -> {
                log.info("[MIRO] 비동기 이메일 전송 결과: {}", result);
            });
            log.info("[MIRO] 비동기 이메일 전송 - After : {}", emailResult.toString());
        }

        return ResponseEntity.ok(res);
    }

    @GetMapping("/auth/verify/{code}/{encodedEmail}")
    public ResponseEntity<DefaultResponse> verifyEmail(
            @PathVariable String code,
            @PathVariable String encodedEmail) {
        DefaultResponse res = authEmailService.verify(code, encodedEmail);

        log.info("[MIRO] 이메일 인증 요청 들어옴 verifyEmail res : {}", res);

        return ResponseEntity.ok(res);
    }

//    @PostMapping("/auth/login")
//    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
//        return ResponseEntity.ok(usersManagementService.login(req));
//    }

    @PostMapping("auth/logout")
    public ResponseEntity<DefaultResponse> logout(
            @RequestBody
            RefreshTokenRequest req){

//    },
//            HttpServletRequest request){


        String refreshToken = null;
//        Cookie[] cookies = request.getCookies();
//        for (Cookie cookie : cookies) {
//
//            if (cookie.getName().equals(JWTUtils.TOKEN_NAME_REFRESH)) {
//
//                log.info("cookie.getName() : {}", cookie.getName());
//                log.info("equals name : {}", JWTUtils.TOKEN_NAME_REFRESH);
//
//                refreshToken = cookie.getValue();
//            }
//        }
//
//        if(refreshToken != null){
//            log.info("refreshToken {} : ", refreshToken);
//        }



        DefaultResponse res = new DefaultResponse();
        log.info("auth/logout");
        log.info("req : {}", req.toString());

        if(refreshToken == null)
            refreshToken = req.getRefreshToken();
//        String refreshToken = req.getRefreshToken();

        LocalDateTime expiresAt = jwtUtils.extractExpiration(refreshToken);
        log.info("Token expires at: {}", expiresAt);

        tokenBlacklistService.addToBlacklist(refreshToken, expiresAt);

        res.setStatus(HttpStatus.OK);
        return ResponseEntity.ok(res);
    }

//    @PostMapping("/auth/refresh_old")
//    public ResponseEntity<RefreshTokenResponse> refreshToken_old(@RequestBody RefreshTokenRequest req) {
//        return ResponseEntity.ok(usersManagementService.refreshToken_old(req));
//    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest req, HttpServletResponse res) {

        log.info("[MIRO] 리프레시 요청 들어옴");

        // 임시 RefreshTokenResponse
        RefreshTokenResponse service_res = usersManagementService.refreshToken(req);

        // 임시 setHeader
        res.setHeader(JWTUtils.TOKEN_NAME_ACCESS, service_res.getAccessToken());

        res.addCookie(createCookie("refresh", service_res.getRefreshToken()));

        return ResponseEntity.ok(service_res);
    }

    // 중복코드
    // 적절한 위치에 유틸 클래스 정의 필요
    private Cookie createCookie(String key, String value) {

        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24*60*60);
        //cookie.setSecure(true);
        //cookie.setPath("/");
        cookie.setHttpOnly(true);

        return cookie;
    }

    @GetMapping("/auth/user")
    public ResponseEntity<UserResponse> getMyProfile() {

        log.info("[MIRO] 유저 정보 요청 들어옴");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();
        User user = usersManagementService.getUserByEmail(email);

        UserResponse response = new UserResponse();

        modelMapper.map(user, response);

        Image image = user.getImage();
        if(image != null){
            response.setProfileImagePath(image.getUripath());
        }

        response.setStatus(HttpStatus.OK);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/user/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {

        log.info("[MIRO] 유저 정보 요청 들어옴 : {}", userId);

        User user = usersManagementService.getUserById(userId);
        UserResponse response = new UserResponse();
        modelMapper.map(user, response);

        return ResponseEntity.ok(response);
    }

//    @PostMapping("/auth/updateNew2")
    @PutMapping("/auth/updateNew2")
    public ResponseEntity<UserResponse> updateUserInfoNew2(
//            @PathVariable Long workspaceId,
//            @RequestPart("requestDTO") CreateChatRoomRequestDTO requestDTO,
            @RequestPart("req") UserUpdateRequest req,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestHeader("Authorization") String token) {

        log.info("[MIRO] 유저 정보 변경 요청 들어옴");

        log.info("/auth/updateNew2 UserUpdateRequest req : {}", req);
        log.info("/auth/updateNew2 image : {}", image);


        User updateUser = new User();

        modelMapper.map(req, updateUser);

        Image saveFile = null;
        if (image == null) {
            if(req.isDontUseProfileImage()){
                updateUser.setImage(saveFile);
            }
        }else{
            try {
                saveFile = imageService.uploadImage(image);
                updateUser.setImage(saveFile);
            } catch (RuntimeException | IOException e) {
                throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value() , "이미지 업로드 실패");
            }
        }

        UserResponse res = usersManagementService.updateUser(updateUser, saveFile);

        if(saveFile != null){
            res.setProfileImagePath(saveFile.getUripath());
        }

        return ResponseEntity.ok(res);
    }



//    @PutMapping("/auth/update/{userId}")
//    public ResponseEntity<DefaultResponse> updateUserById(
//            @PathVariable Long userId,
//            @RequestBody UserUpdateRequest req,
//            @RequestPart("image")MultipartFile image) {
//
//
//        User updateUser = new User();
//
//        modelMapper.map(req, updateUser);
//
//        updateUser.setImage(saveFile);
//
//        DefaultResponse res = usersManagementService.updateUser(userId, updateUser);
//
//        return ResponseEntity.ok(res);
//    }

    @DeleteMapping("/auth/delete/{userId}")
    public ResponseEntity<DefaultResponse> deleteUSer(@PathVariable Long userId) {

        log.info("[MIRO] 유저 정보 삭제 요청 들어옴");

        return ResponseEntity.ok(usersManagementService.deleteUser(userId));
    }

}
