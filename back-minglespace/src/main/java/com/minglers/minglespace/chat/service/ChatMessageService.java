package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;

import java.util.List;
import java.util.Set;

public interface ChatMessageService {
    ChatMessageDTO saveMessage(ChatMessageDTO messageDTO, Long writerUserId, Set<Long> activeUserIds);  // 메시지 저장
    List<ChatMessageDTO> getMessagesByChatRoom(ChatRoom chatRoom);  // 특정 채팅방 메시지 조회
    List<Long> searchMessages(Long chatRoomId, List<String> keywords);
    String updateAnnouncement(Long chatRoomId, Long messageId);
}