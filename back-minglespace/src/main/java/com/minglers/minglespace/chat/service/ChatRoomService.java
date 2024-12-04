package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatListResponseDTO;
import com.minglers.minglespace.chat.dto.CreateChatRoomRequestDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;

import java.util.List;

public interface ChatRoomService {

    List<ChatListResponseDTO> getRoomsByWsMember(Long workspaceId, Long wsMemberId);

    ChatRoom findRoomById(Long chatRoomId);

    ChatListResponseDTO createRoom(CreateChatRoomRequestDTO requestDTO);

    void deleteChatRoomData(Long chatRoomId);

}
