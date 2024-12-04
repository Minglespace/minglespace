package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;

import java.util.List;

public interface ChatRoomMemberService {

    // 채팅방 멤버가 나갈 때 isLeft - true
    void updateIsLeftFromLeave(Long chatRoomId, Long wsMemberId);

    // 참여 유저 추가
    void addUserToRoom(Long chatRoomId, Long wsMemberId);

    // 강퇴
    void kickMemberFromRoom(Long chatRoomId, Long wsMemberId);

    // 채팅방 유저들
    List<ChatRoomMemberDTO> getParticipantsByChatRoomId(Long chatRoomId);

    // 방장 여부
    boolean isRoomLeader(Long chatRoomId, Long wsMemberId);

    // 방장 위임
    void delegateLeader(Long chatRoomId, Long newLeaderId, Long leaderId);

    // 방에 존재하는지 확인
    boolean existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(Long chatRoomId, Long wsMemberId);
}
