package com.minglers.minglespace.chat.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Builder
public class ChatListResponseDTO {
    private Long id;

    private String name;

    private String imageUriPath;

    private Long workSpaceId;

    private LocalDateTime date;

    //마지막 메시지
    private String lastMessage;
    //참여 인원수
    private int participantCount;
}
