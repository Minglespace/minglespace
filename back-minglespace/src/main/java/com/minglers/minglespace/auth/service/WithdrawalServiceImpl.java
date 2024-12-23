package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.Withdrawal;
import com.minglers.minglespace.auth.repository.WithdrawalRepository;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

  @Override
  public DefaultResponse checkVerifyCode(User user, String verifyCode) {

    Optional<Withdrawal> opt = withdrawalRepository.findByUserId(user.getId());
    if(!opt.isPresent()){
      return new DefaultResponse(AuthStatus.NotFoundAccount);
    }

    Withdrawal withdrawal = opt.get();
    String storedCode = withdrawal.getVerifyCode();
    if(storedCode == null || storedCode.isEmpty()){
      return new DefaultResponse(AuthStatus.NotFoundVerifyCode);
    }

    if(!storedCode.equals(verifyCode)){
      return new DefaultResponse(AuthStatus.MismatchVerifyCode);
    }

    // 인증 완료시 인증 코드 제거
    withdrawal.setVerifyCode(null);
    withdrawalRepository.save(withdrawal);

    return new DefaultResponse(AuthStatus.Ok);
  }
}
