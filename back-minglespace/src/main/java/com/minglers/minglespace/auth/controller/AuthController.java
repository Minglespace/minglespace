package com.minglers.minglespace.auth.controller;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.JwtExceptionCode;
import com.minglers.minglespace.auth.oauth2.OAuth2UserMs;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.AuthEmailService;
import com.minglers.minglespace.auth.service.TokenBlacklistService;
import com.minglers.minglespace.auth.service.UserService;
import com.minglers.minglespace.auth.service.WithdrawalService;
import com.minglers.minglespace.auth.type.VerifyType;
import com.minglers.minglespace.auth.type.WithdrawalType;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import com.minglers.minglespace.common.util.CookieManager;
import com.minglers.minglespace.common.util.MsConfig;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
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

//  @GetMapping("/auth/verify/{code}/{encodedEmail}")
//  public ResponseEntity<DefaultResponse> verifyEmail(
//          @PathVariable String code,
//          @PathVariable String encodedEmail) {
//    DefaultResponse res = authEmailService.verify(code, encodedEmail);
//
//    log.info("verifyEmail res : {}", res);
//
//    return ResponseEntity.ok(res);
//  }

  @GetMapping("/auth/verify/{code}/{encodedEmail}/{encodedVerifyType}")
  public ResponseEntity<EmailVerifyResponse> verifyEmail(
          @PathVariable String code,
          @PathVariable String encodedEmail,
          @PathVariable String encodedVerifyType) {

    String email = new String(Base64.getDecoder().decode(encodedEmail), StandardCharsets.UTF_8);
    String strVerifyType = new String(Base64.getDecoder().decode(encodedVerifyType), StandardCharsets.UTF_8);
    User user = userService.getUserByEmail(email);
    VerifyType verifyType = VerifyType.valueOf(strVerifyType);

    EmailVerifyResponse res = null;

    if(verifyType == VerifyType.SIGNUP){
      res = authEmailService.checkVerifyCode(user, code);
      if(res.getMsStatus() == AuthStatus.Ok) {
        user.setVerificationCode("");
        userService.update(user);
      }
    }else if(verifyType == VerifyType.WITHDRAWAL){
      res = withdrawalService.checkVerifyCode(user, code);
      if(res.getMsStatus() == AuthStatus.Ok){
        user.setWithdrawalType(WithdrawalType.ABLE);
        userService.update(user);
      }
    }

    res.setVerifyType(verifyType);
    log.info("verifyEmail res : {}", res.toString());

    return ResponseEntity.ok(res);
  }

  @PostMapping("/auth/login")
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpServletResponse response) {
    LoginResponse res = userService.login(req, response);
    return ResponseEntity.ok(res);
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
  private ResponseEntity<LoginResponse> token(
          HttpServletRequest request,
          HttpServletResponse response) throws IOException {

    LoginResponse res = new LoginResponse();
    String accessToken = CookieManager.get("Authorization", request);
    if(accessToken == null){
      res.setStatus(AuthStatus.NotFoundAccessTokenInCookie);
    }else{
      // accessToken은 쿠키에서 빼서, 헤더에 넣어 준다.
      CookieManager.clear("Authorization", response);
      response.setHeader("Authorization", "Bearer " + accessToken);

      String userEmail = jwtUtils.extractUsername(accessToken);
      User user = userService.getUserByEmail(userEmail);
      res.setWithdrawalType(user.getWithdrawalType());
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

    response.map(user, modelMapper);

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

  @GetMapping("/auth/withdrawal/Info")
  public ResponseEntity<WithdrawalInfoResponse> withdrawalInfo() {

    WithdrawalInfoResponse res = new WithdrawalInfoResponse();

    // 유저 찾기
    User user = getUser();
    if(user == null){
      res.setStatus(AuthStatus.NotFoundAccount);
      return ResponseEntity.ok(res);
    }

    // 만료일 가져오기
    Map<String, Object> result = withdrawalService.getInfo(user);
    AuthStatus status = (AuthStatus) result.get("status");
    if(status != AuthStatus.Ok){
      return ResponseEntity.ok(new WithdrawalInfoResponse(status));
    }

    LocalDateTime expireDate = (LocalDateTime) result.get("expireDate");

    res.setEmail(user.getEmail());
    res.setName(user.getName());
    res.setExpireDate(expireDate);
    res.setWithdrawalType(user.getWithdrawalType());
    res.setStatus(AuthStatus.Ok);

    return ResponseEntity.ok(res);
  }
    // 유저가 회원탈퇴 요청시
  // 이메일 인증 보내고
  // DB 설정 후
  // 이후 로그인시
  // 회원탈퇴로 이동 시킨다.
  @GetMapping("/auth/withdrawal/Email")
  public ResponseEntity<DefaultResponse> withdrawalEmail(HttpServletRequest request, HttpServletResponse response){

    // 유저 찾기
    User user = getUser();
    if(user == null){
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // 이메일 인증을 재전송시 체크
    WithdrawalType withdrawalType = user.getWithdrawalType();
    if(!(withdrawalType == WithdrawalType.NOT || withdrawalType == WithdrawalType.EMAIL)){
      return ResponseEntity.ok(new UserResponse(AuthStatus.WithdrawalEmailAlready));
    }

    // 회원 탈퇴 이메일 인증 코드 생성
    String code = UUID.randomUUID().toString();

    // user WithdrawalType 저장
    user.setWithdrawalType(WithdrawalType.EMAIL);
    userService.update(user);

    // withdrawal 저장
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

  @GetMapping("/auth/withdrawal/Enroll")
  public ResponseEntity<DefaultResponse> withdrawalEnroll(
          HttpServletRequest request, HttpServletResponse response) {

    // 유저 찾기
    User user = getUser();
    if(user == null){
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // 이미 신청 상태이다.
    if(user.getWithdrawalType() == WithdrawalType.DELIVERATION){
      return ResponseEntity.ok(new UserResponse(AuthStatus.WithdrawalDeliverationAlready));
    }

    // 만료일 등록 하고
    Map<String, Object> result = withdrawalService.updateEnroll(user);
    AuthStatus status = (AuthStatus) result.get("status");
    if(status != AuthStatus.Ok){
      return ResponseEntity.ok(new DefaultResponse(status));
    }

    // 유저 상태 변경하고
    userService.updateWithdrawalEnroll(user);

    // 로그 아웃처리
    logoutCommon(request, response);

    return ResponseEntity.ok(new DefaultResponse(AuthStatus.Ok));
  }

  @GetMapping("/auth/withdrawal/Immediately")
  public ResponseEntity<DefaultResponse> withdrawalImmediately(
          HttpServletRequest request, HttpServletResponse response) {

    // 유저 찾기
    User user = getUser();
    if(user == null){
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // 만료시간 설정
    Map<String, Object> result = withdrawalService.updateImmediately(user);
    AuthStatus status = (AuthStatus) result.get("status");
    if(status != AuthStatus.Ok){
      return ResponseEntity.ok(new DefaultResponse(status));
    }

    // 탈퇴유저의 상태, 이메일 변경
    String modifyEmail = (String) result.get("email");
    userService.updateWithdrawalImmediately(user, modifyEmail);

    // 로그 아웃처리
    logoutCommon(request, response);

    return ResponseEntity.ok(new DefaultResponse(AuthStatus.Ok));
  }

  @GetMapping("/auth/withdrawal/Cancel")
  public ResponseEntity<DefaultResponse> withdrawalCancel() {

    // 유저 찾기
    User user = getUser();
    if(user == null){
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // withdrawal 제거
    withdrawalService.del(user);

    // 유저 상태 원상 복구
    userService.updateWithdrawalCancel(user);

    return ResponseEntity.ok(new DefaultResponse(AuthStatus.Ok));
  }
}
