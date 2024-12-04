package com.minglers.minglespace.chat.repository;

import com.minglers.minglespace.chat.entity.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    List<ChatRoomMember> findByChatRoomIdAndIsLeftFalse(Long chatRoomId); //채팅방에 떠나지 않은 멤버 목륵
    List<ChatRoomMember> findByChatRoom_WorkSpace_IdAndWsMember_Id(Long workSpaceId, Long wsMemberId);  // 특정 워크스페이스와 유저가 참여한 채팅방 목록을 조회하는 쿼리
    List<ChatRoomMember> findByChatRoomId(Long chatRoomId); //채팅방에 참여하고 있는 멤버들 get
//    List<ChatRoomMember> findByWsMemberIdAndIsLeftFalse(Long wsMemberId); //멤버가 참여하고 있는 채팅방 목록

    //특정 채팅방에 특정 멤버에 관한 정보
    Optional<ChatRoomMember> findByChatRoomIdAndWsMemberId(Long chatRoomId, Long wsMemberId);

    boolean existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(Long chatRoomId, Long wsMemberId);//해당 채팅방에 멤버가 떠나지 않는 상태로 존재하는지
    boolean existsByChatRoomIdAndWsMemberId(Long chatRoomId, Long wsMemberId); //해당 채팅방 안에 떠난 상태 상관없이 멤버가 존재하는지
    boolean existsByChatRoomIdAndIsLeftFalse(Long chatRoomId); //방에 남아있는 멤버가 있는지

    void deleteByChatRoomId(Long chatRoomId);

    //isLeft 변경하기(강퇴, 초대 등)
    @Modifying
    @Query("UPDATE ChatRoomMember crm SET crm.isLeft = :isLeft WHERE crm.chatRoom.id = :chatRoomId AND crm.wsMember.id = :wsMemberId")
    int updateIsLeftStatus(@Param("isLeft") boolean isLeft, @Param("chatRoomId")  Long chatRoomId, @Param("wsMemberId") Long wsMemberId);

    //특정방 리더 id 찾기
    @Query("SELECT crm.wsMember.id FROM ChatRoomMember crm WHERE crm.chatRoom.id = :chatRoomId AND crm.chatRole = 'CHATLEADER'")
    Long findChatLeaderByChatRoomId(@Param("chatRoomId") Long chatRoomId);
}
