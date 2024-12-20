package com.minglers.minglespace.common.service;

import com.minglers.minglespace.common.dto.NotificationDTO;
import com.minglers.minglespace.common.type.NotificationType;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface NotificationService {
  void sendNotification(Long userId, String message, String path, NotificationType type);
  void deleteNotifications(List<Long> notificationIds);
  String updateIsRead(Long notificationId);
  List<NotificationDTO> getNotificationsByUser(Long userId);
  void deleteOldReadNotifications();
}
