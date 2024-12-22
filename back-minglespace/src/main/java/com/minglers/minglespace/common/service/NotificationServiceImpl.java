package com.minglers.minglespace.common.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import com.minglers.minglespace.common.dto.NotificationDTO;
import com.minglers.minglespace.common.entity.Notification;
import com.minglers.minglespace.common.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Log4j2
public class NotificationServiceImpl implements NotificationService{
  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;

  private final SimpMessagingTemplate simpMessagingTemplate;
  private final StompInterceptor stompInterceptor;

  @Override
  public void sendNotification(Long recipientUserId, String message, String path) { //, String type
    User user = userRepository.findById(recipientUserId)
            .orElseThrow(() -> new RuntimeException("알림 받을 유저를 찾지 못했습니다."));
    Notification notification = Notification.builder()
            .noticeMsg(message)
            .path(path)
            .user(user)
            .build();

    Notification saved = notificationRepository.save(notification);

    //실시간 전송하기
    sendNotificationToUser(recipientUserId, saved.toDTO());
  }

  private void sendNotificationToUser(Long recipientUserId, NotificationDTO notificationDTO){
    Set<String> sessionIds = stompInterceptor.getSessionForUser(recipientUserId);

    if(sessionIds != null && !sessionIds.isEmpty()){
      sessionIds.forEach(sessionId -> {
        String cleanSession = sessionId.replaceAll("[\\[\\]]", "");
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(cleanSession);
        headerAccessor.setLeaveMutable(true);
        simpMessagingTemplate.convertAndSendToUser(cleanSession, "/queue/notifications", notificationDTO, headerAccessor.getMessageHeaders());
      });
    }else {
      // 세션이 없을 때는 알림을 저장만 하고 클라이언트가 로그인하면 확인하도록 처리
      log.warn("No active sessions found for userId: " + recipientUserId);
    }
  }
}