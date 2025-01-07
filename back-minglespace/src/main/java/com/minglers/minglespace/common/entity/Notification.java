package com.minglers.minglespace.common.entity;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.common.dto.NotificationDTO;
import com.minglers.minglespace.common.type.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

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

  @Enumerated(EnumType.STRING)
  private NotificationType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "recipient_user_id", nullable = false)
  private User user;

  @CreationTimestamp
  @Column(name = "notice_time", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
  private LocalDateTime noticeTime;

  @Builder.Default
  private boolean isRead = false;

//  @PrePersist
//  public void prePersist(){
//    if(noticeTime == null){
//      noticeTime = LocalDateTime.now();
//    }
//  }

  public NotificationDTO toDTO() {
    return NotificationDTO.builder()
            .id(this.id)
            .noticeMsg(this.noticeMsg)
            .path(this.path)
            .noticeTime(this.noticeTime)
            .recipientUserId(this.user.getId())
            .isRead(this.isRead)
            .type(this.type.name())
            .build();
  }
}
