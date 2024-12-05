package com.minglers.minglespace.auth.controller;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserService;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@RestController
@RequiredArgsConstructor
class AuthController {

    private final UserService usersManagementService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JWTUtils jwtUtils;
    private final ImageService imageService;
    private final ModelMapper modelMapper;

    @PostMapping("/auth/signup")
    public ResponseEntity<DefaultResponse> signup(@RequestBody SignupRequest reg) {
        return ResponseEntity.ok(usersManagementService.signup(reg));
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

//    @GetMapping("/auth/user/{userId}")
//    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
//        return ResponseEntity.ok(usersManagementService.getUserById(userId));
//    }

    @PutMapping("/auth/update/{userId}")
    public ResponseEntity<DefaultResponse> updateUser(
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
