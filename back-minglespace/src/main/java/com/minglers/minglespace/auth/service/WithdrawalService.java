package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.entity.User;

public interface WithdrawalService {

  void add(User user, String verifyCode);
  DefaultResponse checkVerifyCode(User user, String verifyCode);

}
