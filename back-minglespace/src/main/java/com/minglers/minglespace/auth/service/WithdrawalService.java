package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.EmailVerifyResponse;
import com.minglers.minglespace.auth.entity.User;

public interface WithdrawalService {

  void add(User user, String verifyCode);
  EmailVerifyResponse checkVerifyCode(User user, String verifyCode);

}
