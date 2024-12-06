package com.minglers.minglespace.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatListResponseDTO {
  private Long chatRoomId;
  private String name;
  private String imageUriPath;
  private Long workSpaceId;
  private LocalDateTime date;
  private String lastMessage;
  private int participantCount;
}
