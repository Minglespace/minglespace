package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;

import java.util.List;

public interface ChatMessageService {
    ChatMessage saveMessage(ChatMessageDTO messageDTO, Long writerUserId);  // 메시지 저장
    List<ChatMessageDTO> getMessagesByChatRoom(ChatRoom chatRoom);  // 특정 채팅방 메시지 조회
    List<Long> searchMessages(Long chatRoomId, List<String> keywords);
}