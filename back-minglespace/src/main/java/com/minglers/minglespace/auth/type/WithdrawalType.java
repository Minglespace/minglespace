package com.minglers.minglespace.auth.type;

public enum WithdrawalType {
  NOT("탈퇴 상황이 아님"),
  EMAIL("탈퇴 신청을 위한 이메일 인증 대기중"),
  ABLE("탈퇴 신청 가능"),
  DELIVERATION("탈퇴 신청 완료 후 숙려 기간"),
  DONE("탈퇴 처리됨");

  private final String desc;
  WithdrawalType(String desc){
    this.desc = desc;
  }
}
