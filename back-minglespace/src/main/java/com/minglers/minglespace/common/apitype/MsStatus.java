package com.minglers.minglespace.common.apitype;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Spring Boot의 enum은
 * name과
 * desc 포함하여
 * JSON으로 자동 변환
{
  "name": "Ok",
  "desc": "정상"
}
**/
public enum MsStatus {

  Ok("정상"),
  Exception("예기치 못한 오류."),
  AlreadyJoinedEmail("이미 가입한 이메일 입니다."),
  DuplicateEmail("이메일 중복,."),


  MismatchPw("비밀번호가 틀림"),
  AuthInternalError("인증 서비스 내부 오류"),
  NotFoundAccount("사용자가 존재하지 않은 경우"),
  NotFoundAccessTokenInCookie("액세스 토큰이 쿠키에 없음."),
  ExpiredRefreshToken("리프레시 토큰 만료됨."),

  DbError("데이터베이스 오류"),
  DbDataIntegrityViolation("데이터 무결성 오류가 발생"),
  DbInsertError("데이터베이스에 Insert중 에러"),

  EmailVerificationFirst("이메일 인증 먼저"),
  EmailVerificationAlready("이미 유저 이메일 인증 성공"),
  EmailVerificationCodeMismatch("유저 이메일 인증 번호 틀림"),

  NullProperty("유저 입력 프로퍼티가 비어 있음"),

  ImageUploadException("이미지 업로드 예외"),


  ;

  private final String desc;

  MsStatus(String desc) {
    this.desc = desc;
  }

  public String getDesc(){
    return this.desc;
  }

  // `@JsonValue` 어노테이션을 추가하여, JSON 직렬화 시 `desc`를 값으로 사용하도록 변경
  @JsonValue
  public String getStatusValue() {
    return this.name();  // 혹은 원하는 필드를 반환할 수 있습니다. (여기서는 `name()`을 반환)
  }

}
