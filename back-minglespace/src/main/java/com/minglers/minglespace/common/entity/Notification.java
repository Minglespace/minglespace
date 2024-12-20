package com.minglers.minglespace.common.entity;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.common.converter.LocalDateTimeAttributeConverter;
import com.minglers.minglespace.common.dto.NotificationDTO;
import com.minglers.minglespace.common.type.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notification")
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String noticeMsg;
  private String path;

//  @Enumerated(EnumType.STRING)
//  private NotificationType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "recipient_user_id", nullable = false)
  private User user;

  @Convert(converter = LocalDateTimeAttributeConverter.class)
  @Column(name = "notice_time", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
  private LocalDateTime noticeTime;

  @PrePersist
  public void prePersist(){
    if(noticeTime == null){
      noticeTime = LocalDateTime.now();
    }
  }

  public NotificationDTO toDTO() {
    return NotificationDTO.builder()
            .id(this.id)
            .noticeMsg(this.noticeMsg)
            .path(this.path)
            .noticeTime(this.noticeTime)
            .recipientUserId(this.user.getId())
            .build();
  }
}
