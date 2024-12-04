package com.minglers.minglespace.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageDTO {
//    요청
//    내용, 보낸 사람, 채팅방 아이디, 답글여부, 날짜
//    응답은 id만이니까

    private Long id;
    private String content;
    private Long writer;
    private Long chatRoomId;
    private Long replyId;
    private LocalDateTime date;
    //파일
}
