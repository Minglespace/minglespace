package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatRoomDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.workspace.entity.WSMember;

import java.util.List;

public interface ChatRoomService {

    List<ChatRoomDTO.ListResponse> getRoomsByWsMember(Long workspaceId, Long wsMemberId);

    ChatRoom findRoomById(Long chatRoomId);

    ChatRoomDTO.ListResponse createRoom(ChatRoomDTO.CreateRequest requestDTO, WSMember createMember, Image image);

    void deleteChatRoomData(Long chatRoomId);

}
