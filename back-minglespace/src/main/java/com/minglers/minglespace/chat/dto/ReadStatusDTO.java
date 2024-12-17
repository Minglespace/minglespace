package com.minglers.minglespace.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReadStatusDTO {
  private Long chatRoomId;
  private Long wsMemberId;
}
