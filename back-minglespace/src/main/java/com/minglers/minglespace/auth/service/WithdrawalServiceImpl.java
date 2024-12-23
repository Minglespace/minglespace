package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.Withdrawal;
import com.minglers.minglespace.auth.repository.WithdrawalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class WithdrawalServiceImpl implements WithdrawalService{

  private final WithdrawalRepository withdrawalRepository;

  @Override
  public void add(User user, String verifyCode) {

    Withdrawal withdrawal = new Withdrawal();

    withdrawal.setUserId(user.getId());
    withdrawal.setEmail(user.getEmail());
    withdrawal.setVerifyCode(verifyCode);

    withdrawalRepository.save(withdrawal);

  }
}
