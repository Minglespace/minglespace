package com.minglers.minglespace.auth.controller;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.AuthEmailService;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserService;
import com.minglers.minglespace.auth.service.WithdrawalService;
import com.minglers.minglespace.auth.type.WithdrawalType;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import com.minglers.minglespace.common.util.CookieManager;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequiredArgsConstructor
class AuthController {

  private final UserService userService;
  private final TokenBlacklistService tokenBlacklistService;
  private final JWTUtils jwtUtils;
  private final AuthEmailService authEmailService;
  private final ImageService imageService;
  private final ModelMapper modelMapper;
  private final WithdrawalService withdrawalService;

  @PostMapping("/auth/signup")
  public ResponseEntity<DefaultResponse> signup(@RequestBody SignupRequest reg, HttpServletRequest request) throws MessagingException {

    // 이메일 인증 코드 생성
    String code = UUID.randomUUID().toString();

    // 유저에 세팅
    reg.setVerificationCode(code);

    // 회원가입 서비스 진행
    DefaultResponse res = userService.signup(reg);
    if(res.equals(AuthStatus.Ok)){

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
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpServletResponse response) {
    return ResponseEntity.ok(userService.login(req, response));
  }

  @PostMapping("auth/logout")
  public ResponseEntity<DefaultResponse> logout(
          HttpServletRequest request,
          HttpServletResponse response){

    log.info("auth/logout");

    logoutCommon(request, response);

    return ResponseEntity.ok(new DefaultResponse().setStatus(AuthStatus.Ok));
  }

  private void logoutCommon(HttpServletRequest request, HttpServletResponse response){
    String refreshToken = CookieManager.get(JWTUtils.REFRESH_TOKEN, request);
    CookieManager.clear(JWTUtils.REFRESH_TOKEN, response);

    if(refreshToken != null){
      LocalDateTime expiresAt = jwtUtils.extractExpiration(refreshToken);
      log.info("Token expires at: {}", expiresAt);
      tokenBlacklistService.addToBlacklist(refreshToken, expiresAt);
    }
  }

  @GetMapping("/auth/token")
  private ResponseEntity<DefaultResponse> token(
          HttpServletRequest request,
          HttpServletResponse response){

    DefaultResponse res = new DefaultResponse();
    String accessToken = CookieManager.get("Authorization", request);
    if(accessToken == null){
      res.setStatus(AuthStatus.NotFoundAccessTokenInCookie);
    }else{
      // accessToken은 쿠키에서 빼서, 헤더에 넣어 준다.
      CookieManager.clear("Authorization", response);
      response.setHeader("Authorization", "Bearer " + accessToken);
      res.setStatus(AuthStatus.Ok);
    }
    return ResponseEntity.ok(res);
  }

  private User getUser(){
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    return userService.getUserByEmail(email);
  }

  @GetMapping("/auth/user")
  public ResponseEntity<UserResponse> getMyProfile() {
    User user = getUser();
    if(user == null){
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    UserResponse response = new UserResponse();

    response.map(modelMapper, user);

    response.setStatus(AuthStatus.Ok);
    return ResponseEntity.ok(response);
  }

//  @GetMapping("/auth/user/{userId}")
//  public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
//
//    User user = userService.getUserById(userId);
//    if(user == null){
//      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
//    }
//
//    UserResponse response = new UserResponse();
//    modelMapper.map(user, response);
//
//    return ResponseEntity.ok(response);
//  }

  @PutMapping("/auth/update")
  public ResponseEntity<DefaultResponse> updateUser(
          @RequestPart("req") UserUpdateRequest req,
          @RequestPart(value = "image", required = false) MultipartFile image) {

    User updateUser = new User();

    modelMapper.map(req, updateUser);

    Image saveFile = null;
    if (image == null) {
      if(req.isDontUseProfileImage()){
        updateUser.setImage(null);
      }
    }else{
      try {
        saveFile = imageService.uploadImage(image);
        updateUser.setImage(saveFile);
      } catch (RuntimeException | IOException e) {
        return ResponseEntity.ok(new UserResponse().setStatus(AuthStatus.ImageUploadException));
      }
    }

    UserResponse res = userService.updateUser(updateUser, saveFile, req.isDontUseProfileImage());

    if(saveFile != null){
      res.setProfileImagePath(saveFile.getUripath());
    }

    return ResponseEntity.ok(res);
  }

  @DeleteMapping("/auth/delete/{userId}")
  public ResponseEntity<DefaultResponse> deleteUSer(@PathVariable Long userId) {
    return ResponseEntity.ok(userService.deleteUser(userId));
  }

  // 유저가 회원탈퇴 요청시
  // 이메일 인증 보내고
  // DB 설정 후
  // 이후 로그인시
  // 회원탈퇴로 이동 시킨다.
  @GetMapping("/auth/withdrawal")
  public ResponseEntity<DefaultResponse> withdrawal(HttpServletRequest request, HttpServletResponse response){

    // 유저 찾기
    User user = getUser();
    if(user == null){
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // 회원 탈퇴 이메일 인증 코드 생성
    String code = UUID.randomUUID().toString();

    // user WithdrawalType 저장
    user.setWithdrawalType(WithdrawalType.EMAIL);
    UserResponse userResponse = userService.updateUser(user, null, false);

    // withdrawal table 저장
    withdrawalService.add(user, code);

    // 이메일 전송
    CompletableFuture<String> emailResult = authEmailService.sendWithdrawal(code, user.getEmail(), request);
    log.info("비동기 이메일 전송 : {}", emailResult.toString());
    emailResult.thenAccept(result -> {
      log.info("비동기 이메일 전송 결과: {}", result);
    });

    // 인증 초기화
    logoutCommon(request, response);

    // 클라에서는 로그아웃 패킷 보낼 필요 없이 자체 로그 아웃 하면 된다.

    return ResponseEntity.ok(new DefaultResponse(AuthStatus.Ok));
  }
}
