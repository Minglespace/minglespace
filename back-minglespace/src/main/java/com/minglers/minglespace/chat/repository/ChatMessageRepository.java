package com.minglers.minglespace.chat.repository;

import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long>, JpaSpecificationExecutor<ChatMessage> {
  @Query("SELECT cm FROM ChatMessage cm LEFT JOIN FETCH cm.images WHERE cm.chatRoom.id = :chatRoomId AND cm.isDeleted = FALSE ORDER BY cm.date DESC")
  Page<ChatMessage> findByChatRoomIdAndIsDeletedFalse(Long chatRoomId, Pageable pageable);
  List<ChatMessage> findByChatRoomIdAndContentContaining(Long chatRoomId, String keyword); //search

  // 채팅방의 마지막 메시지 조회
  @Query(value = "SELECT * FROM chatmessage WHERE chatroom_id = :chatRoomId AND is_deleted=false ORDER BY date DESC LIMIT 1", nativeQuery = true)
  Optional<ChatMessage> findLatestMessageByChatRoomId(@Param("chatRoomId") Long chatRoomId);
  Optional<ChatMessage> findByChatRoomIdAndIsAnnouncementTrue(Long chatRoomId);

  @Modifying
  @Query("UPDATE ChatMessage c SET c.isDeleted = true WHERE c.id = :id")
  int softDeleteById(@Param("id")Long id);

  void deleteByChatRoomId(Long chatRoomId);
}
