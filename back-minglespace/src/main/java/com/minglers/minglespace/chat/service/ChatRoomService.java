package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatListResponseDTO;
import com.minglers.minglespace.chat.dto.CreateChatRoomRequestDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.workspace.entity.WSMember;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ChatRoomService {

    List<ChatListResponseDTO> getRoomsByWsMember(Long workspaceId, Long wsMemberId);

    ChatRoom findRoomById(Long chatRoomId);

    ChatListResponseDTO createRoom(CreateChatRoomRequestDTO requestDTO, WSMember createMember, MultipartFile image);

    void deleteChatRoomData(Long chatRoomId);

}
