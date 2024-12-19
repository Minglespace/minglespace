package com.minglers.minglespace.common.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.common.dto.NotificationDTO;
import com.minglers.minglespace.common.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {
  private final NotificationService notificationService;
  private final JWTUtils jwtUtils;

  @GetMapping
  public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
  }

  @DeleteMapping("/{notificationId}")
  public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId){
    notificationService.deleteNotification(notificationId);
    return ResponseEntity.ok().build();
  }
}
