
export const AuthStatus = Object.freeze({

  Ok:                 {value:"Ok",                  desc:"정상"},
  Exception:          {value:"Exception",           desc:"예기치 못한 오류가 발생했습니다."},

  //유저
  NotFoundAccount:      {value:"NotFoundAccount",       desc:"이메일 또는 비밀번호를 확인하세요."},
  MismatchPw:           {value:"MismatchPw",            desc:"이메일 또는 비밀번호를 확인하세요."},
  ImageUploadException: {value:"ImageUploadException",  desc:"유저정보 수정에 문제가 발생했습니다."},

  //로그인
  AuthInternalError:            {value:"AuthInternalError",             desc:"예기치 못한 오류가 발생했습니다."},
  NotFoundAccessTokenInCookie:  {value:"NotFoundAccessTokenInCookie",   desc:"로그인 인증에 문제가 발생했습니다."},
  ExpiredRefreshToken:          {value:"ExpiredRefreshToken",           desc:"로그인 시간이 오래되어 로그아웃 되었습니다."},

  //DB
  DbError:                    {value:"DbError",                   desc:"시스템 오류가 발생했습니다(1)."},
  DbDataIntegrityViolation:   {value:"DbDataIntegrityViolation",  desc:"시스템 오류가 발생했습니다(1)."},
  DbInsertError:              {value:"DbInsertError",             desc:"시스템 오류가 발생했습니다(1)."},

  //회원 가입
  AlreadyJoinedEmail:             {value:"AlreadyJoinedEmail",            desc:"이미 가입한 이메일(소셜 포함) 입니다."},
  EmailVerificationFirst:         {value:"EmailVerificationFirst",        desc:"이메일 인증해야 회원가입이 완료 됩니다."},
  EmailVerificationAlready:       {value:"EmailVerificationAlready",      desc:"이미 이메일 인증이 완료 되었습니다."},
  EmailVerificationCodeMismatch:  {value:"EmailVerificationCodeMismatch", desc:"이메일 인증 코드가 일치하지 않습니다."},
  NullProperty:                   {value:"NullProperty",                  desc:"비어있는 항목을 확인하세요."},

  //회원 탈퇴
  WithdrawalEmailFirst:     {value:"WithdrawalEmailFirst",    desc:"먼저 회원탈퇴 이메일 인증을 완료하세요."},
  WithdrawalAble:           {value:"WithdrawalAble",          desc:"회원탈퇴 페이지에서 신청 가능합니다."},
  WithdrawalDeliveration:   {value:"WithdrawalDeliveration",  desc:"회원탈퇴 숙려기간 중입니다."},
  WithdrawalDone:           {value:"WithdrawalDone",          desc:"회원탈퇴가 완료 되었습니다."},
  NotFoundWithdrawal:       {value:"NotFoundWithdrawal",      desc:"회원탈퇴 신청정보가 없습니다."},
  NotFoundVerifyCode:       {value:"NotFoundVerifyCode",      desc:"회원탈퇴 인증코드를 찾을 수 없습니다."},
  MismatchVerifyCode:       {value:"MismatchVerifyCode",      desc:"회원탈퇴 인증코드가 일치하지 않습니다."},


});

export const AuthStatusOk = (msStatus) => {
  return AuthStatus[msStatus] === AuthStatus.Ok;
}

