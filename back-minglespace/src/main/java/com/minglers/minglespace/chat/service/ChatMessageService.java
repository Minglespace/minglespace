package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatMsgRequestDTO;
import com.minglers.minglespace.chat.dto.ChatMsgResponseDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface ChatMessageService {
    ChatMsgResponseDTO saveMessage(ChatMsgRequestDTO messageDTO, Long writerUserId, Set<Long> activeUserIds);  // 메시지 저장
    Map<String, Object> getMessagesByChatRoom(Long chatRoomId, int page, int size);  // 특정 채팅방 메시지 조회
    List<Long> searchMessages(Long chatRoomId, List<String> keywords);
    String updateAnnouncement(Long chatRoomId, Long messageId);
    String deleteMessage(Long chatRoomId, Long messageId);
}