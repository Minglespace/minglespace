package com.minglers.minglespace.chat.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
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
public class ChatMessageDTO {
  private Long id;
  private String content;
  private Long writerWsMemberId;
  private Long chatRoomId;
  private Long replyId;
  private LocalDateTime date;
  private Boolean isAnnouncement;
  private String sender; //response
  private Long workspaceId; //request_url에 포함하도록 수정?
  private List<Long> mentionedUserIds; //request
  //파일

  public ChatMessage toEntity(ChatRoom chatRoom, WSMember wsMember, ChatMessage parentMsg){
    return ChatMessage.builder()
            .content(this.getContent())
            .wsMember(wsMember)
            .chatRoom(chatRoom)
            .parentMessage(parentMsg)
            .date(LocalDateTime.now())
            .isAnnouncement(this.getIsAnnouncement())
            .build();
  }
}
