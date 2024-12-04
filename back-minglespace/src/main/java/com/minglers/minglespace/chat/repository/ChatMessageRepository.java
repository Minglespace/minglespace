package com.minglers.minglespace.chat.repository;

import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatRoomId(Long chatRoomId);
    List<ChatMessage> findByChatRoom(ChatRoom chatRoom);

    // 채팅방의 마지막 메시지 조회
    @Query(value = "SELECT * FROM chatmessage WHERE chat_room_id = :chatRoomId ORDER BY date DESC LIMIT 1", nativeQuery = true)
    Optional<ChatMessage> findLatestMessageByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    void deleteByChatRoomId(Long chatRoomId);
}
