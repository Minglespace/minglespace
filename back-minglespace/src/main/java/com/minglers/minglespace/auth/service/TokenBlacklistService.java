package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.entity.TokenBlacklist;
import com.minglers.minglespace.auth.repository.TokenBlacklistRepository;
import com.minglers.minglespace.auth.security.JWTUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

  private final TokenBlacklistRepository tokenBlacklistRepository;

  public void addToBlacklist(String token, LocalDateTime expiresAt){

    TokenBlacklist tokenBlacklist = new TokenBlacklist();

    tokenBlacklist.setToken(token);
    tokenBlacklist.setCreateAt(LocalDateTime.now());
    tokenBlacklist.setExpiresAt(expiresAt);

    tokenBlacklistRepository.save(tokenBlacklist);
  }

  public boolean isBlacklisted(String refreshToken){
    return tokenBlacklistRepository.findByToken(refreshToken).isPresent();
  }

  // 주기적으로 만료된 토큰을 삭제하는 메서드
//  @Scheduled(fixedRate = 3600000 / 2) // 1시간마다 실행
  @Scheduled(fixedDelay = JWTUtils.EXPIRATION_TIME) // 1시간마다 실행
  @Transactional
  public void removeExpiredTokens() {
    LocalDateTime now = LocalDateTime.now();
    tokenBlacklistRepository.deleteAllByExpiresAtBefore(now);  // 만료된 토큰 삭제
  }

}
