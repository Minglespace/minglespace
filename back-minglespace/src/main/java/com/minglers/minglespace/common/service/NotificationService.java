package com.minglers.minglespace.common.service;

public interface NotificationService {
  void sendNotification(Long userId, String message, String path); //, String type
}
