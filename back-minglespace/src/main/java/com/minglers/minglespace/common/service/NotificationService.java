package com.minglers.minglespace.common.service;

import com.minglers.minglespace.common.type.NotificationType;

public interface NotificationService {
  void sendNotification(Long userId, String message, String path, NotificationType type); //
  void deleteNotification(Long notificationId);
}
