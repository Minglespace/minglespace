package com.minglers.minglespace.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
public class Withdrawal {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private Long userId;

  private String email;

  private String verifyCode;

  @CreationTimestamp
  private LocalDateTime regDate;

  private LocalDateTime expireDate;

  private LocalDateTime cancelDate;

}
