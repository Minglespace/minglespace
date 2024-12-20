package com.minglers.minglespace.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
  private Long id;
  private String noticeMsg;
  private String path;
  private LocalDateTime noticeTime;
  private Long recipientUserId;
  private boolean isRead;
  private String type;
}
