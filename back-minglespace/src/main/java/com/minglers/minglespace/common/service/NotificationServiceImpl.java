package com.minglers.minglespace.common.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import com.minglers.minglespace.common.dto.NotificationDTO;
import com.minglers.minglespace.common.entity.Notification;
import com.minglers.minglespace.common.repository.NotificationRepository;
import com.minglers.minglespace.common.type.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
  public void sendNotification(Long recipientUserId, String message, String path, NotificationType type) {
    User user = userRepository.findById(recipientUserId)
            .orElseThrow(() -> new RuntimeException("알림 받을 유저를 찾지 못했습니다."));
    if(type.equals(NotificationType.CHAT_NEW_MESSAGE)){
      if(handleChatNewMessageNotification(recipientUserId)){
        return;
      }
    }
    Notification notification = Notification.builder()
            .noticeMsg(message)
            .path(path)
            .user(user)
            .type(type)
            .build();

    Notification saved = notificationRepository.save(notification);
    //실시간 전송하기
    sendNotificationToUser(recipientUserId, saved.toDTO());
  }

  @Override
  public void deleteNotifications(List<Long> notificationIds) {
    notificationRepository.deleteAllById(notificationIds);
  }

  @Override
  public String updateIsRead(Long notificationId) {
    int count = notificationRepository.markNotificationAsRead(notificationId);
    if (count > 0) {
      return "SUCCESS";  // 성공 응답
    } else {
      return "FAILED";  // 실패 응답
    }
  }

  @Override
  public List<NotificationDTO> getNotificationsByUser(Long userId) {
    List<Notification> noticeList = notificationRepository.findByUser_Id(userId, Sort.by(Sort.Order.desc("noticeTime")));
    return noticeList.stream()
            .map(Notification::toDTO)
            .toList();
  }
  
  //하루에 한 번, 한 달 이상된 확인된 알림 삭제
  @Override
  @Scheduled(cron = "0 0 0 * * ?")
  public void deleteOldReadNotifications() {
    LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
    notificationRepository.deleteOldReadNotifications(oneMonthAgo);
  }

  private void sendNotificationToUser(Long recipientUserId, NotificationDTO notificationDTO){
    log.info("알림 메시지: "+ notificationDTO.getNoticeMsg());
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

  private boolean handleChatNewMessageNotification(Long recipientUserId){
    Notification notification = notificationRepository.findByTypeAndUser_Id(NotificationType.CHAT_NEW_MESSAGE, recipientUserId).orElse(null);
    if(notification != null){
      if(notification.isRead()){
        notification.setRead(false);
      }
      notification.setNoticeTime(LocalDateTime.now());
      notificationRepository.save(notification);
      sendNotificationToUser(recipientUserId, notification.toDTO());
      return true;
    }
    return false;
  }
}
