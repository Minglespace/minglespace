package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.chat.entity.MsgReadStatus;
import com.minglers.minglespace.chat.repository.ChatRoomMemberRepository;
import com.minglers.minglespace.chat.repository.MsgReadStatusRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
      List<ChatRoomMember> members = chatRoomMemberRepository.findByChatRoomId(saveMsg.getChatRoom().getId());

      if (members.isEmpty()){
        throw new RuntimeException("메시지 저장하는 채팅방에 멤버가 없습니다.");
      }
      List<MsgReadStatus> list = members.stream()
              .map(member -> MsgReadStatus.builder()
                      .message(saveMsg)
                      .wsMember(member.getWsMember())
                      .build())
              .collect(Collectors.toList());

      msgReadStatusRepository.saveAll(list);
    }catch (Exception e){
      log.error("메시지 읽음 처리 테이블에 저장 중 오류 발생: ",e.getMessage());
      throw new RuntimeException("메시지 읽음 처리 테이블에 저장 중 오류 발생: ", e);
    }

  }
}
