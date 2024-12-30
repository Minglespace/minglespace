package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.EmailVerifyResponse;
import com.minglers.minglespace.auth.entity.User;

import java.util.Map;

public interface WithdrawalService {

  void add(User user, String verifyCode);
  void del(User user);
  EmailVerifyResponse checkVerifyCode(User user, String verifyCode);

  Map<String, Object> getInfo(User user);
  Map<String, Object> updateEnroll(User user);
  Map<String, Object> updateImmediately(User user);
}
