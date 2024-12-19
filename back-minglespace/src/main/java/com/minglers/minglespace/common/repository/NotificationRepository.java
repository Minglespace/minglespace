package com.minglers.minglespace.common.repository;

import com.minglers.minglespace.common.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUser_Id(Long userId);
}
