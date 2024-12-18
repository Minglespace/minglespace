
export const MsStatus = Object.freeze({

  Ok:                 {value:"Ok",                  desc:"정상"},
  AlreadyJoinedEmail: {value:"AlreadyJoinedEmail",  desc:"이미 가입한 이메일 입니다."},
  DuplicateEmail:     {value:"DuplicateEmail",      desc:"이메일 또는 비밀번호를 확인하세요."},
  NotFoundAccount:    {value:"NotFoundAccount",     desc:"이메일 또는 비밀번호를 확인하세요."},
  
  EmailVerificationFirst:     {value:"EmailVerificationFirst",    desc:"이메일 인증해야 회원가입이 완료 됩니다."},
  ExpiredRefreshToken:        {value:"ExpiredRefreshToken",       desc:"로그인 인증이 만료 되었습니다."},

});

export const MsStatusOk = (msStatus) => {
  return MsStatus[msStatus] === MsStatus.Ok;
}

