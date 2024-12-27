package com.minglers.minglespace.common.repository;

import com.minglers.minglespace.common.entity.Notification;
import com.minglers.minglespace.common.type.NotificationType;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUser_Id(Long userId, Sort sort);

  //오래된 알림 삭제 (현 기준-한달)
  @Modifying
  @Transactional
  @Query("DELETE FROM Notification n WHERE n.noticeTime < :oneMonthAgo AND n.isRead = true")
  void deleteOldReadNotifications(LocalDateTime oneMonthAgo);

  @Modifying
  @Transactional
  @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId")
  int markNotificationAsRead(Long notificationId);

  List<Notification> findByTypeAndUser_Id(NotificationType type, Long userId);
}
