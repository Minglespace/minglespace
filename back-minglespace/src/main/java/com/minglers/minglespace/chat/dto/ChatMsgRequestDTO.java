package com.minglers.minglespace.chat.dto;

import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.workspace.entity.WSMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMsgRequestDTO {
  private String content;
//  private Long writerWsMemberId;
  private Long chatRoomId;
  private Long replyId;
//  private LocalDateTime date;
  private Boolean isAnnouncement;
  private Long workspaceId;
  private List<Long> mentionedUserIds;
  private List<Long> imageIds; //request

  public ChatMessage toEntity(ChatRoom chatRoom, WSMember wsMember, ChatMessage parentMsg){
    return ChatMessage.builder()
            .content(this.getContent())
            .wsMember(wsMember)
            .chatRoom(chatRoom)
            .parentMessage(parentMsg)
            .isAnnouncement(this.getIsAnnouncement())
//            .images(images)
            .build();
  }
}
