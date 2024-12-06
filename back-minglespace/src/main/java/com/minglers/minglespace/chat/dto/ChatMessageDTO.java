package com.minglers.minglespace.chat.dto;

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
  private Long workspaceId; //request
  private List<Long> mentionedUserIds; //request
  private Boolean isAnnouncement;
  //파일

}
