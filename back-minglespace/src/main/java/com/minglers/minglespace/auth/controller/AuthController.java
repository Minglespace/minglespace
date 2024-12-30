package com.minglers.minglespace.auth.controller;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
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
import com.minglers.minglespace.workspace.service.WSMemberService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
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
  private final WSMemberService wsMemberService;

  @PostMapping("/auth/signup")
  public ResponseEntity<DefaultResponse> signup(
          @Valid
          @RequestBody SignupRequest req,
          BindingResult bindingResult,
          HttpServletRequest request) throws MessagingException {

    // 유효성 검사
    if(bindingResult.hasErrors()){
      String error = bindingResult.getAllErrors().get(0).getDefaultMessage();
      AuthStatus authStatus = AuthStatus.valueOf(error);
      return ResponseEntity.ok(new DefaultResponse(authStatus));
    }

    // 비밀번호 컴펌 검사
    if(!req.getPassword().equals(req.getConfirmPassword())){
      return ResponseEntity.ok(new DefaultResponse(AuthStatus.SinupValideConfirmPwMismatch));
    }

    // 이메일 인증 코드 생성
    String code = UUID.randomUUID().toString();

    // 유저에 세팅
    req.setVerificationCode(code);

    // 회원가입 서비스 진행
    DefaultResponse res = userService.signup(req);
    if (res.equals(AuthStatus.Ok)) {
      // 이메일 인증
      CompletableFuture<String> emailResult = authEmailService.sendEmail(code, req.getEmail(), request);
      emailResult.thenAccept(result -> {
        log.info("비동기 이메일 전송 결과: {}", result);
      });
    }

    return ResponseEntity.ok(res);
  }

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

    switch (verifyType){
      case SIGNUP -> {
        // 회원가입 이메일 인증 확인
        res = authEmailService.checkVerifyCode(user, code);
        if (res.getMsStatus() == AuthStatus.Ok) {
          user.setVerificationCode("");
          userService.update(user);
        }
      }
      case WITHDRAWAL -> {
        // 회원탈퇴 이메일 인증 확인
        res = withdrawalService.checkVerifyCode(user, code);
        if (res.getMsStatus() == AuthStatus.Ok) {
          user.setWithdrawalType(WithdrawalType.ABLE);
          userService.update(user);
        }
      }
      case CHANGE_PW -> {
        // 비밀번호 변경 이메일 인증 확인
        res = userService.checkVerifyCodeChangePw(user, code);
      }
    }

    res.setVerifyType(verifyType);
    log.info("verifyEmail res : {}", res.toString());

    return ResponseEntity.ok(res);
  }

  // 자체 로그인 부분은 controller -> handler 쪽으로 변경해보자(비지니스 로직과 보안 로직의 구분)
  // 소셜 로그인 부분은 이미 handler으로 되어 있음.
  @PostMapping("/auth/login")
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpServletResponse response) {
    LoginResponse res = userService.login(req, response);
    return ResponseEntity.ok(res);
  }

  @PostMapping("auth/logout")
  public ResponseEntity<DefaultResponse> logout(
          HttpServletRequest request,
          HttpServletResponse response) {

    logoutCommon(request, response);

    return ResponseEntity.ok(new DefaultResponse().setStatus(AuthStatus.Ok));
  }

  private void logoutCommon(HttpServletRequest request, HttpServletResponse response) {

    // 쿠키에서 REFRESH_TOKEN 정리
    String refreshToken = CookieManager.get(JWTUtils.REFRESH_TOKEN, request);
    CookieManager.clear(JWTUtils.REFRESH_TOKEN, response);

    // REFRESH_TOKEN 블랙 리스트에 등록, REFRESH_TOKEN 토큰을 무효화 시키는 역할이다.
    // ACCESS_TOKEN은 만료시간을 짧게 주어, 관리 대상에서 제외한다.
    if (refreshToken != null) {
      LocalDateTime expiresAt = jwtUtils.extractExpiration(refreshToken);
      log.info("Token expires at: {}", expiresAt);
      tokenBlacklistService.addToBlacklist(refreshToken, expiresAt);
    }
  }

  // 소셜 로그인에서 사용한다.
  // 클라에서 쿠키(http onley, 자바스크립트에서 접근 못하게 막음)에 있는
  // ACCESS_TOKEN을 헤더에 넣어 보내달라고 요청하는 패킷이다.
  @GetMapping("/auth/token")
  private ResponseEntity<LoginResponse> token(
          HttpServletRequest request,
          HttpServletResponse response) throws IOException {

    LoginResponse res = new LoginResponse();
    String accessToken = CookieManager.get("Authorization", request);
    if (accessToken == null) {
      res.setStatus(AuthStatus.NotFoundAccessTokenInCookie);
    } else {
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

  // SecurityContextHolder에서 로그인한 유저의 email을 얻어, DB에서 User를 찾아준다.
  private User getLoinedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    return userService.getUserByEmail(email);
  }

  @GetMapping("/auth/user")
  public ResponseEntity<UserResponse> getMyProfile() {
    User user = getLoinedUser();
    if (user == null) {
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    UserResponse response = new UserResponse();

    response.map(user, modelMapper);
    response.setStatus(AuthStatus.Ok);

    return ResponseEntity.ok(response);
  }

  @PutMapping("/auth/update")
  public ResponseEntity<DefaultResponse> updateUser(
          @RequestPart("req") UserUpdateRequest req,
          @RequestPart(value = "image", required = false)
          MultipartFile image) {

    User updateUser = new User();

    // 새로운 유저에 변경할 정보를 넣은다.
    modelMapper.map(req, updateUser);

    // imageService : 프로필 이미지 처리
    Image saveFile = null;
    if (req.isDontUseProfileImage()) {
      updateUser.setImage(null);
    } else if (image != null){
      try {
        saveFile = imageService.uploadImage(image);
        updateUser.setImage(saveFile);
      } catch (RuntimeException | IOException e) {
        return ResponseEntity.ok(new UserResponse().setStatus(AuthStatus.ImageUploadException));
      }
    }

    // userService : 유저에 반영
    UserResponse res = userService.updateUser(updateUser, saveFile, req.isDontUseProfileImage());

    return ResponseEntity.ok(res);
  }

  @GetMapping("/auth/withdrawal/Info")
  public ResponseEntity<WithdrawalInfoResponse> withdrawalInfo() {

    WithdrawalInfoResponse res = new WithdrawalInfoResponse();

    // 유저 찾기
    User user = getLoinedUser();
    if (user == null) {
      res.setStatus(AuthStatus.NotFoundAccount);
      return ResponseEntity.ok(res);
    }

    // 숙려기간 가져오기
    Map<String, Object> result = withdrawalService.getInfo(user);
    AuthStatus status = (AuthStatus) result.get("status");
    if (status != AuthStatus.Ok) {
      return ResponseEntity.ok(new WithdrawalInfoResponse(status));
    }
    LocalDateTime expireDate = (LocalDateTime) result.get("expireDate");

    // 회원탈퇴 정보 세팅
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
  public ResponseEntity<DefaultResponse> withdrawalEmail(HttpServletRequest request, HttpServletResponse response) {

    // 유저 찾기
    User user = getLoinedUser();
    if (user == null) {
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // 탈퇴 가능여부 체크
    String resultLeader = wsMemberService.withdrawalCheckLeader(user.getId());
    if(!resultLeader.equals("SUCCESS")){
      log.info("[MIRO] 탈퇴 가능여부 체크 : {}", resultLeader);
      return ResponseEntity.ok(new UserResponse(AuthStatus.MSG_FROM_SERVER, resultLeader));
    }

    // 이메일 인증을 재전송시 체크
    WithdrawalType withdrawalType = user.getWithdrawalType();
    if (!(withdrawalType == WithdrawalType.NOT || withdrawalType == WithdrawalType.EMAIL)) {
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

    // 로그아웃 처리
    // 클라에서는 로그아웃 패킷 보낼 필요 없이 자체 로그 아웃 하면 된다.
    logoutCommon(request, response);

    return ResponseEntity.ok(new DefaultResponse(AuthStatus.Ok));
  }

  @GetMapping("/auth/withdrawal/Enroll")
  public ResponseEntity<DefaultResponse> withdrawalEnroll(
          HttpServletRequest request, HttpServletResponse response) {

    // 유저 찾기
    User user = getLoinedUser();
    if (user == null) {
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // 이미 신청 상태이다.
    if (user.getWithdrawalType() == WithdrawalType.DELIVERATION) {
      return ResponseEntity.ok(new UserResponse(AuthStatus.WithdrawalDeliverationAlready));
    }

    // 만료일 등록 하고
    Map<String, Object> result = withdrawalService.updateEnroll(user);
    AuthStatus status = (AuthStatus) result.get("status");
    if (status != AuthStatus.Ok) {
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
    User user = getLoinedUser();
    if (user == null) {
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // 만료시간 설정
    Map<String, Object> result = withdrawalService.updateImmediately(user);
    AuthStatus status = (AuthStatus) result.get("status");
    if (status != AuthStatus.Ok) {
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
    User user = getLoinedUser();
    if (user == null) {
      return ResponseEntity.ok(new UserResponse(AuthStatus.NotFoundAccount));
    }

    // withdrawal 제거
    withdrawalService.del(user);

    // 유저 상태 원상 복구
    userService.updateWithdrawalCancel(user);

    return ResponseEntity.ok(new DefaultResponse(AuthStatus.Ok));
  }

  @PostMapping("/auth/changepw/request")
  public ResponseEntity<DefaultResponse> changepwImmediately(
          @Valid
          @RequestBody
          ChangePwRequest req,
          BindingResult bindingResult,
          HttpServletRequest request,
          HttpServletResponse response ) {

    if(bindingResult.hasErrors()){
      String error = bindingResult.getAllErrors().get(0).getDefaultMessage();
      log.info("[MIRO] : {}, {}", AuthStatus.ChangePwInvalid, error);
      return ResponseEntity.ok(new DefaultResponse(AuthStatus.ChangePwInvalid));
    }

    String code = UUID.randomUUID().toString();

    // 저장
    Map<String, Object> userResult = userService.saveChangePw(req, code);
    AuthStatus status = (AuthStatus) userResult.get("status");
    if (status != AuthStatus.Ok) {
      return ResponseEntity.ok(new DefaultResponse(AuthStatus.ChangePwNotFountUser));
    }

    // 이메일 전송
    CompletableFuture<String> emailResult = authEmailService.sendChangePw(code, req.getEmail(), request);
    log.info("비동기 이메일 전송 : {}", emailResult.toString());
    emailResult.thenAccept(result -> {
      log.info("비동기 이메일 전송 결과: {}", result);
    });

    // 로그 아웃처리
    logoutCommon(request, response);

    return ResponseEntity.ok(new DefaultResponse(AuthStatus.Ok));
  }


}