package com.minglers.minglespace.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomResponseDTO {
    private Long chatRoomId;
    private Long workSpaceId;
    private String imageUriPath;
    private String name;
    private List<ChatMessageDTO> messages;
    private List<ChatRoomMemberDTO> participants;
}
