package com.minglers.minglespace.common.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.common.dto.NotificationDTO;
import com.minglers.minglespace.common.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notificationService;
  private final JWTUtils jwtUtils;

  @GetMapping
  public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
  }

  @DeleteMapping("/clear")
  public ResponseEntity<Void> clearNotifications(@RequestBody List<Long> notificationIds){
    try {
      notificationService.deleteNotifications(notificationIds);
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @PutMapping("/{notificationId}")
  public ResponseEntity<String> updateIsRead(@PathVariable Long notificationId){
    return ResponseEntity.ok(notificationService.updateIsRead(notificationId));
  }
}
