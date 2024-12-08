package com.minglers.minglespace.chat.repository;

import com.minglers.minglespace.chat.entity.MsgReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MsgReadStatusRepository extends JpaRepository<MsgReadStatus, Long> {

  long countByMessage_ChatRoom_IdAndWsMemberId(Long chatRoomId, Long wsMemberId); //안읽은 메시지 카운트
  long deleteByMessage_ChatRoom_IdAndWsMemberId(Long chatRoomId, Long wsMemberId);
  List<MsgReadStatus> findByChatMessageId(Long chatMessageId);
}
