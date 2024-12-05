package com.minglers.minglespace.chat.repository;

import com.minglers.minglespace.chat.entity.MsgReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MsgReadStatusRepository extends JpaRepository<MsgReadStatus, Long> {
}
