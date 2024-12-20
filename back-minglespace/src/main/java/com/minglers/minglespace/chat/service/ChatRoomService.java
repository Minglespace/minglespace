package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatListResponseDTO;
import com.minglers.minglespace.chat.dto.ChatRoomResponseDTO;
import com.minglers.minglespace.chat.dto.CreateChatRoomRequestDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.workspace.entity.WSMember;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface ChatRoomService {

    List<ChatListResponseDTO> getRoomsByWsMember(Long workspaceId, Long wsMemberId);

    ChatRoom findRoomById(Long chatRoomId);

    ChatListResponseDTO createRoom(CreateChatRoomRequestDTO requestDTO, Long userId, MultipartFile image);

    void deleteChatRoomData(Long chatRoomId);

    ChatRoomResponseDTO getChatRoomWithMsgAndParticipants(Long chatRoomId, Long workspaceId, Long userId);

    Map<String, Object> updateChatRoom(Long chatRoomId,String name,MultipartFile image, String isImageDelete);
}
