package com.minglers.minglespace.common.apitype;
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
  AlreadyJoinedEmail("이미 가입한 이메일 입니다."),
  ;

  private final String desc;

  MsStatus(String desc) {
    this.desc = desc;
  }

  public String getDesc(){
    return this.desc;
  }

}
