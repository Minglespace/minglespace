
export const AuthStatus = Object.freeze({

  Ok:                 {value:"Ok",                  desc:"정상"},
  Exception:          {value:"Exception",           desc:"예기치 못한 오류가 발생했습니다."},
  
  AlreadyJoinedEmail: {value:"AlreadyJoinedEmail",  desc:"이미 가입한 이메일(소셜 포함) 입니다."},
  NotFoundAccount:    {value:"NotFoundAccount",     desc:"이메일 또는 비밀번호를 확인하세요."},
  
  EmailVerificationFirst:     {value:"EmailVerificationFirst",    desc:"이메일 인증해야 회원가입이 완료 됩니다."},
  ExpiredRefreshToken:        {value:"ExpiredRefreshToken",       desc:"로그인 인증이 만료 되었습니다."},

});

export const AuthStatusOk = (msStatus) => {
  return AuthStatus[msStatus] === AuthStatus.Ok;
}

