package com.minglers.minglespace.chat.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ChatRoomDTO {
  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ListResponse{
    private Long chatRoomId;
    private String name;
    private String imageUriPath;
    private Long workSpaceId;
    private LocalDateTime date;
    private String lastMessage;
    private int participantCount;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class RoomResponse{
    private Long chatRoomId;
    private String name;
    private String imageUriPath;
    private Long workSpaceId;
    private List<ChatMessageDTO> messages;
    private List<ChatRoomMemberDTO> participants;
    private Long LeaderWsMemberId;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class CreateRequest{
    private String name;
    //    private MultipartFile image;
    private Long workspaceId;
    private List<Long> participantIds;
  }

}
