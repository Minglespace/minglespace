package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.chat.entity.MsgReadStatus;
import com.minglers.minglespace.chat.exception.ChatException;
import com.minglers.minglespace.chat.repository.ChatRoomMemberRepository;
import com.minglers.minglespace.chat.repository.MsgReadStatusRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class MsgReadStatusServiceImpl implements MsgReadStatusService{
  private final MsgReadStatusRepository msgReadStatusRepository;
  private final ChatRoomMemberRepository chatRoomMemberRepository;

  @Override
  @Transactional
  public void createMsgForMembers(ChatMessage saveMsg) {
    try{
      List<ChatRoomMember> members = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalse(saveMsg.getChatRoom().getId());

      if (members.isEmpty()){
        throw new ChatException(HttpStatus.NOT_FOUND.value(), "메시지 저장하는 채팅방에 멤버가 없습니다.");
      }

      List<MsgReadStatus> list = members.stream()
              .filter(member -> !member.getWsMember().getId().equals(saveMsg.getWsMember().getId()))
              .map(member -> MsgReadStatus.builder()
                      .message(saveMsg)
                      .wsMember(member.getWsMember())
                      .build())
              .collect(Collectors.toList());

      msgReadStatusRepository.saveAll(list);
    }catch (Exception e){
      log.error("메시지 읽음 처리 테이블에 저장 중 오류 발생: ",e.getMessage());
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "메시지 읽음 처리 테이블에 저장 중 오류 발생");
    }

  }

  @Override
  @Transactional
  public void deleteMsgReadStatus(Long chatRoomId, Long wsMemberId) {
    try {
      long deletedCount = msgReadStatusRepository.deleteByMessage_ChatRoom_IdAndWsMemberId(chatRoomId, wsMemberId);

      if (deletedCount == 0) {
        throw new ChatException(HttpStatus.NOT_FOUND.value(), "읽음 처리할 메시지가 없습니다. 채팅방 ID: " + chatRoomId + ", 유저 ID: " + wsMemberId);
      }

      log.info("Messages marked as read and deleted for chat room ID: " + chatRoomId + " and user ID: " + wsMemberId);

    } catch (Exception e) {
      log.error("Error occurred while deleting message read status: ", e);
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "메시지 읽음 처리 삭제 중 오류 발생");  // 예외를 던짐
    }
  }

}
