package com.minglers.minglespace.auth.repository;

import com.minglers.minglespace.auth.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
  Optional<Withdrawal> findByEmail(String email);
  void deleteByEmail(String email);

  // 만료일이 지나고, 처리되지 않은 회원탈퇴 요청을 조회하는 메소드
  List<Withdrawal> findByExpireDateBeforeAndProcessedFalse(LocalDateTime now);
}
