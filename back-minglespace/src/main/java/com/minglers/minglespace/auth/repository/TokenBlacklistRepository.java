package com.minglers.minglespace.auth.repository;

import com.minglers.minglespace.auth.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {
  Optional<TokenBlacklist> findByToken(String token);
  void deleteAllByExpiresAtBefore(LocalDateTime expiresAt);
}
