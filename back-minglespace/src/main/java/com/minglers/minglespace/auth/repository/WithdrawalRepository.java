package com.minglers.minglespace.auth.repository;

import com.minglers.minglespace.auth.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
}
