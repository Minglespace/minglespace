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
  NullProperty("유저 입력 프로퍼티가 비어 있음"),
  SinupValideEmailEmpty("이메일을 입력해주세요."),
  SinupValideEmailWrong("올바른 이메일 형식이 아닙니다."),
  SinupValidePwWEmpty("비밀번호를 입력해주세요."),
  SinupValidePwWLength("비밀번호를 입력해주세요."),
  SinupValidePwWrong("최소 8자 이상이며, 대소문자, 특수문자가 포함해야 합니다."),
  SinupValideNameEmpty("이름을 입력해주세요."),
  SinupValidePhoneEmpty("전화번호를 입력해주세요."),
  SinupValidePhoneWrong("올바른 전화번호 형식이 아닙니다."),
  SinupValideConfirmPwMismatch("비밀번호가 패스워드 확인과 일치하지 않습니다."),

  //회원 탈퇴
  WithdrawalEmailFirst("회원탈퇴 이메일 인증 먼저"),
  WithdrawalEmailAlready("회원탈퇴 이메일 인증 이미 완료상태"),
  WithdrawalAble("회원탈퇴 신청가능."),
  WithdrawalDeliveration("회원탈퇴 숙려기간."),
  WithdrawalDeliverationAlready("회원탈퇴 이미 신청상태."),

  WithdrawalDone("회원탈퇴 완료."),
  NotFoundWithdrawal("탈퇴정보를 찾을 수 없음."),
  NotFoundVerifyCode("탈퇴 인증 코드를 찾을 수 없음."),
  MismatchVerifyCode("탈퇴 인증 코드 불일치."),

  //비밀번호 변경
  ChangePwInvalid("비밀번호가 유효하지 않습니다."),
  ChangePwEmpty("변경할 비밀번호가 비어있음."),
  ChangePwEmailVerifyAlready("이미 비밀번호 변경 이메일 인증 성공"),
  ChangePwEmailVerifyMismatch("비밀번호 변경 이메일 인증 코드 틀림"),
  ChangePwNotFountUser("비밀번호 변경 유저를 찾지 못함"),

  ;

  private final String desc;
  AuthStatus(String desc) {
    this.desc = desc;
  }
}
