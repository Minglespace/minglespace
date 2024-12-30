package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.dto.EmailVerifyResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.Withdrawal;
import com.minglers.minglespace.auth.repository.WithdrawalRepository;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.util.MsConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Log4j2
@RequiredArgsConstructor
@Service
public class WithdrawalServiceImpl implements WithdrawalService{

  private final WithdrawalRepository withdrawalRepository;
  private final UserService userService;

  @Override
  public void add(User user, String verifyCode) {

    Withdrawal withdrawal = null;
    Optional<Withdrawal> opt = withdrawalRepository.findByEmail(user.getEmail());
    if(opt.isPresent()){
      withdrawal = opt.get();
    }else{
      withdrawal = new Withdrawal();
    }

    withdrawal.setUserId(user.getId());
    withdrawal.setEmail(user.getEmail());
    withdrawal.setVerifyCode(verifyCode);

    withdrawalRepository.save(withdrawal);
  }

  @Transactional
  @Override
  public void del(User user) {
    withdrawalRepository.deleteByEmail(user.getEmail());
  }

  @Override
  public EmailVerifyResponse checkVerifyCode(User user, String verifyCode) {

    Optional<Withdrawal> opt = withdrawalRepository.findByEmail(user.getEmail());
    if(!opt.isPresent()){
      return new EmailVerifyResponse(AuthStatus.NotFoundAccount);
    }

    Withdrawal withdrawal = opt.get();
    String storedCode = withdrawal.getVerifyCode();
    if(storedCode == null || storedCode.isEmpty()){
      return new EmailVerifyResponse(AuthStatus.NotFoundVerifyCode);
    }

    if(!storedCode.equals(verifyCode)){
      return new EmailVerifyResponse(AuthStatus.MismatchVerifyCode);
    }

    // 인증 완료시 인증 코드 제거
    withdrawal.setVerifyCode(null);
    withdrawalRepository.save(withdrawal);

    return new EmailVerifyResponse(AuthStatus.Ok);
  }

  @Override
  public Map<String, Object> getInfo(User user) {

    Map<String, Object> resultMap = new HashMap<>();

    Optional<Withdrawal> opt = withdrawalRepository.findByEmail(user.getEmail());
    if(!opt.isPresent()){
      resultMap.put("status", AuthStatus.NotFoundAccount);
      return resultMap;
    }

    Withdrawal withdrawal = opt.get();
    resultMap.put("expireDate", withdrawal.getExpireDate()); // LocalDateTime
    resultMap.put("status", AuthStatus.Ok);

    return resultMap;
  }

  @Override
  public Map<String, Object> updateEnroll(User user) {

    Map<String, Object> resultMap = new HashMap<>();

    Optional<Withdrawal> opt = withdrawalRepository.findByEmail(user.getEmail());
    if(!opt.isPresent()){
      resultMap.put("status", AuthStatus.NotFoundAccount);
      return resultMap;
    }

    Withdrawal withdrawal = opt.get();
    String storedCode = withdrawal.getVerifyCode();
    if(storedCode != null && !storedCode.isEmpty()){
      resultMap.put("status", AuthStatus.WithdrawalEmailFirst);
      return resultMap;
    }

    // 만료기간을 설정한다
    int hours = MsConfig.getWithdrawalExpireHours();
    log.error("[MIRO] 회원탈퇴 숙려기간 : {}", hours);
    withdrawal.setExpireDate(hours, "hours");
    withdrawalRepository.save(withdrawal);

    resultMap.put("status", AuthStatus.Ok);

    return resultMap;

  }

  @Override
  public Map<String, Object> updateImmediately(User user){

    Map<String, Object> resultMap = new HashMap<>();

    Optional<Withdrawal> opt = withdrawalRepository.findByEmail(user.getEmail());
    if(!opt.isPresent()){
      resultMap.put("status", AuthStatus.NotFoundAccount);
      return resultMap;
    }

    Withdrawal withdrawal = opt.get();
    String storedCode = withdrawal.getVerifyCode();
    if(storedCode != null && !storedCode.isEmpty()){
      resultMap.put("status", AuthStatus.WithdrawalEmailFirst);
      return resultMap;
    }

    // 이메일을 만료시간 꼬리표를 붙여 추후 해당 이메일로 재가입을 가능하게 한다.
    // 만료일을 신청일과 일치시켜 즉시처리임을 판단할 수 있다.
    String modifyEmail = user.getEmail() + "." + withdrawal.getRegDate();
    setExpireProcessed(withdrawal, modifyEmail, withdrawal.getRegDate());

    resultMap.put("status", AuthStatus.Ok);
    resultMap.put("email", modifyEmail);

    return resultMap;
  }

  private void setExpireProcessed(Withdrawal withdrawal, String modifyEmail, LocalDateTime expireDate){
    withdrawal.setProcessed(true);
    withdrawal.setExpireDate(expireDate);
    withdrawal.setEmail(modifyEmail);

    withdrawalRepository.save(withdrawal);
  }

  @Scheduled(fixedDelay = MsConfig.WITHDRAWAL_POLLING_CYCLE_MILLS)
  public void checkExpiredWithdrawals() {
    log.info("[MIRO][Scheduled] 회원탈퇴 처리할게 있는지 확인하러 왔어요. 검사주기는 : {}", MsConfig.WITHDRAWAL_POLLING_CYCLE_MILLS);

    LocalDateTime now = LocalDateTime.now();

    // 만료된 회원탈퇴 요청을 찾아서 처리
    List<Withdrawal> expiredWithdrawals = withdrawalRepository.findByExpireDateBeforeAndProcessedFalse(now);

    for (Withdrawal withdrawal : expiredWithdrawals) {
      // 탈퇴 프로세스를 실행
      processWithdrawal(withdrawal, now);
    }
  }

  private void processWithdrawal(Withdrawal withdrawal, LocalDateTime expireDate) {

    User updateUser = userService.getUserByEmail(withdrawal.getEmail());
    if(updateUser == null){
      // 처리 필요
      log.info("[MIRO] 처리 필요 : ");
      return;
    }

    // 회원탈퇴 처리 로직
    String modifyEmail = updateUser.getEmail() + "." + expireDate;
    setExpireProcessed(withdrawal, modifyEmail, expireDate);

    userService.updateWithdrawalImmediately(updateUser, modifyEmail);

    log.info("[MIRO][Scheduled] 회원탈퇴 처리 완료 : {}",  withdrawal.getEmail());
  }

}
