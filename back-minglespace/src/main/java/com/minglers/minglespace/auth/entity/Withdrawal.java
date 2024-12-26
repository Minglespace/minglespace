package com.minglers.minglespace.auth.entity;

import jakarta.persistence.*;
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

  @Column(unique = true)
  private String email;

  private String verifyCode;

  @CreationTimestamp
  private LocalDateTime regDate;

  private LocalDateTime expireDate;

  private boolean processed = false; // 처리 여부

  public void setExpireDate(int duration, String unit) {
    switch (unit.toLowerCase()) {
      case "hours":
        this.expireDate = LocalDateTime.now().plusHours(duration);
        break;
      case "minutes":
        this.expireDate = LocalDateTime.now().plusMinutes(duration);
        break;
      case "days":
        this.expireDate = LocalDateTime.now().plusDays(duration);
        break;
      default:
        throw new IllegalArgumentException("Invalid unit: " + unit);
    }
  }
}
