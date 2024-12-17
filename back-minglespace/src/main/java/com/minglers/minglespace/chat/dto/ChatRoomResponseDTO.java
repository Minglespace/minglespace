package com.minglers.minglespace.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomResponseDTO {
  private Long chatRoomId;
  private String name;
  private String imageUriPath;
  private Long workSpaceId;
  private List<ChatMsgResponseDTO> messages;
  private List<ChatRoomMemberDTO> participants;
  private boolean msgHasMore;
}
