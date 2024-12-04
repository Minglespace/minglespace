package com.minglers.minglespace.chat.dto;

import com.minglers.minglespace.chat.role.ChatRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomMemberDTO {
    //채팅방에 참여중인 멤버들의 목록
    private Long wsMemberId;
    private String email;
    private String name;
    private String imageUriPath;
    private String position;
    private String chatRole;

    //enum인 권한 string으로 변환해 저장하기
    public void setChatRole(ChatRole chatRole){
        this.chatRole = chatRole != null ? chatRole.name() : null;
    }
}

