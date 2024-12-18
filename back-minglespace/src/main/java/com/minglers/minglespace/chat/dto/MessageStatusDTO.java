package com.minglers.minglespace.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageStatusDTO {
  private Long chatRoomId;
  private Long wsMemberId;
  private Long messageId;
  private String type;
}
