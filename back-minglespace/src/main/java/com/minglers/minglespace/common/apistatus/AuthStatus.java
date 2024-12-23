package com.minglers.minglespace.common.apistatus;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum AuthStatus {

  Ok("정상"),
  Exception("예기치 못한 오류."),

  //유저
  NotFoundAccount("사용자가 존재하지 않은 경우"),
  MismatchPw("비밀번호가 틀림"),
  NullProperty("유저 입력 프로퍼티가 비어 있음"),
  ImageUploadException("이미지 업로드 예외"),

  //로그인
  AuthInternalError("인증 서비스 내부 오류"),
  NotFoundAccessTokenInCookie("액세스 토큰이 쿠키에 없음."),
  ExpiredRefreshToken("리프레시 토큰 만료됨."),

  //DB
  DbError("데이터베이스 오류"),
  DbDataIntegrityViolation("데이터 무결성 오류가 발생"),
  DbInsertError("데이터베이스에 Insert중 에러"),

  //회원 가입
  AlreadyJoinedEmail("이미 등록한 이메일(소셜 포함) 유저 입니다."),
  EmailVerificationFirst("이메일 인증 먼저"),
  EmailVerificationAlready("이미 유저 이메일 인증 성공"),
  EmailVerificationCodeMismatch("유저 이메일 인증 번호 틀림"),

  //회원 탈퇴
  WithdrawalEmailFirst("회원탈퇴 이메일 인증 먼저"),
  WithdrawalAble("회원탈퇴 신청가능."),
  WithdrawalDeliveration("회원탈퇴 숙려기간."),
  WithdrawalDone("회원탈퇴 완료."),
  NotFoundWithdrawal("탈퇴정보를 찾을 수 없음."),
  NotFoundVerifyCode("탈퇴 인증 코드를 찾을 수 없음."),
  MismatchVerifyCode("탈퇴 인증 코드 불일치."),


  ;

  private final String desc;

  AuthStatus(String desc) {
    this.desc = desc;
  }

//  // `@JsonValue` 어노테이션을 추가하여, JSON 직렬화 시 `desc`를 값으로 사용하도록 변경
//  @JsonValue
//  public String getStatusValue() {
//    return this.name();  // 혹은 원하는 필드를 반환할 수 있습니다. (여기서는 `name()`을 반환)
//  }

}
