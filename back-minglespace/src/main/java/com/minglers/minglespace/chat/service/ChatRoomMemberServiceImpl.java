package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.chat.exception.ChatException;
import com.minglers.minglespace.chat.repository.ChatMessageRepository;
import com.minglers.minglespace.chat.repository.ChatRoomMemberRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.chat.repository.MsgReadStatusRepository;
import com.minglers.minglespace.chat.role.ChatRole;
import com.minglers.minglespace.common.service.NotificationService;
import com.minglers.minglespace.common.type.NotificationType;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomMemberServiceImpl implements ChatRoomMemberService {
  private final ChatRoomMemberRepository chatRoomMemberRepository;
  private final ChatRoomRepository chatRoomRepository;
  private final WSMemberRepository wsMemberRepository;
  private final MsgReadStatusRepository msgReadStatusRepository;
  private final ChatMessageRepository chatMessageRepository;

  private final NotificationService notificationService;

  @Override
  @Transactional
  public void updateIsLeftFromLeave(Long chatRoomId, Long wsMemberId) {
    if (!chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId)) {
      throw new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방에 참여하지 않은 유저입니다.");
    }

    int updateResult = chatRoomMemberRepository.updateIsLeftStatus(true, chatRoomId, wsMemberId);
    if (updateResult == 0) {
      throw new ChatException(HttpStatus.BAD_REQUEST.value(), "사용자를 채팅방에서 나갔다는 상태로 업데이트하는데 실패했습니다.");
    }

  }

  @Override
  @Transactional
  public String addUserToRoom(Long chatRoomId, Long wsMemberId) {
    ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "해당하는 채팅방이 없습니다.."));
    WSMember member = wsMemberRepository.findById(wsMemberId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "해당하는 멤버가 없습니다. "));

    if (chatRoomMemberRepository.existsByChatRoomIdAndWsMemberId(chatRoomId, wsMemberId)) {
      chatRoomMemberRepository.updateIsLeftStatus(false, chatRoomId, wsMemberId);
    } else {
      ChatRoomMember chatRoomMember = ChatRoomMember.builder()
              .chatRoom(chatRoom)
              .chatRole(ChatRole.CHATMEMBER)
              .wsMember(member)
              .date(LocalDateTime.now())
              .build();

      chatRoom.addChatRoomMember(chatRoomMember);
      chatRoomMemberRepository.save(chatRoomMember);
    }
    notificationService.sendNotification(member.getUser().getId(), "'" + chatRoom.getName() + "' 채팅방에 초대되었습니다.", "/workspace/" + chatRoom.getWorkSpace().getId() + "/chat", NotificationType.CHAT);

    return "참여자 추가 완료";
  }

  @Override
  @Transactional
  public String kickMemberFromRoom(Long chatRoomId, Long wsMemberId) {
    chatRoomMemberRepository.updateIsLeftStatus(true, chatRoomId, wsMemberId);

    ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방을 찾지 못했습니다."));
    WSMember wsMember = wsMemberRepository.findById(wsMemberId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "강퇴할 멤버를 찾지 못했습니다."));
    notificationService.sendNotification(wsMember.getUser().getId(), "'" + chatRoom.getName() + "' 채팅방에서 강퇴되었습니다.", "/workspace/" + chatRoom.getWorkSpace().getId() + "/chat", NotificationType.CHAT);
    return "참여자 강퇴 완료";
  }

  @Override
  public List<ChatRoomMemberDTO> getParticipantsByChatRoomId(Long chatRoomId) {
    List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalseAndUserWithdrawalTypeNot(chatRoomId);

    return chatRoomMembers.stream()
            .map(ChatRoomMember::toDTO)
            .collect(Collectors.toList());
  }

  @Override
  public boolean isRoomLeader(Long chatRoomId, Long wsMemberId) {
    Long leaderId = chatRoomMemberRepository.findChatLeaderByChatRoomId(chatRoomId);
    return wsMemberId.equals(leaderId);
  }

  @Override
  public String delegateLeader(Long chatRoomId, Long newLeaderId, Long leaderId) {
    try {
      ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방이 존재하지 않습니다."));
      ChatRoomMember chatRoomMember = chatRoomMemberRepository.findByChatRoomIdAndWsMemberId(chatRoomId, leaderId)
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "사용자가 존재하지 않습니다."));

      if (!chatRoomMember.getChatRole().equals(ChatRole.CHATLEADER)) {
        throw new ChatException(HttpStatus.FORBIDDEN.value(), "방장만 방장 권한을 위임할 수 있습니다.");
      }

      ChatRoomMember newLeader = chatRoomMemberRepository.findByChatRoomIdAndWsMemberId(chatRoomId, newLeaderId)
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "사용자가 존재하지 않습니다."));

      chatRoomMember.setChatRole(ChatRole.CHATMEMBER);
      newLeader.setChatRole(ChatRole.CHATLEADER);

      chatRoomMemberRepository.save(chatRoomMember);
      chatRoomMemberRepository.save(newLeader);

      notificationService.sendNotification(newLeader.getWsMember().getUser().getId(),
              "'" + chatRoom.getName() + "' 채팅방의 새로운 방장으로 임명되셨습니다.",
              "/workspace/" + chatRoom.getWorkSpace().getId() + "/chat",
              NotificationType.CHAT);
    } catch (ChatException e) {
      throw e;
    } catch (Exception e) {
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "방장 위임 중 오류 발생");
    }
    return "방장 위임 완료";
  }


  ///강제 위임 기능만 냅두기. isleft상태 변경이나 삭제 빼고
  //탈퇴할때는 모든 워크스페이스 방장 위임이고, 워크스페이스는 해당 워크스페이스의 채팅방들만 방장 위임이라 별개일듯
  //워크스페이스-채팅방 함수를 분리해서 탈퇴함수에 불러 써야 할 듯함.
  ////--> 상태 변경안하고 강제 위임만 하면 문제점 ) 만약 ui에 done으로 구분해서 보이는거면 
  @Override
  @Transactional
  public void forceDelegateLeader(Long userId) {
    List<WSMember> wsMembers = wsMemberRepository.findAllByUserId(userId);

    for (WSMember wsMember : wsMembers) {
      List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByWsMemberIdAndIsLeftFalse(wsMember.getId());

      for (ChatRoomMember chatRoomMember : chatRoomMembers) {
        if (this.isRoomLeader(chatRoomMember.getChatRoom().getId(), wsMember.getId())) {
//          log.info("방장이어서 위임해야함: "+ chatRoomMember.getChatRoom().getId());
          List<ChatRoomMember> roomMembers = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalseAndUserWithdrawalTypeNot(chatRoomMember.getChatRoom().getId());
          if (roomMembers.size() > 1) {
            ChatRoomMember newLeader = roomMembers.stream()
                    .filter(member -> !member.getWsMember().getId().equals(wsMember.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "새로운 방장 후보가 없습니다."));

            chatRoomMember.setChatRole(ChatRole.CHATMEMBER);
//            chatRoomMember.setLeft(true); //탈퇴 완료 시
            newLeader.setChatRole(ChatRole.CHATLEADER);

            chatRoomMemberRepository.save(chatRoomMember); //탈퇴 신청 시
//            chatRoomMemberRepository.delete(chatRoomMember); //ws 나갈때
            chatRoomMemberRepository.save(newLeader);

            notificationService.sendNotification(newLeader.getWsMember().getUser().getId(),
                    "'" + chatRoomMember.getChatRoom().getName() + "' 채팅방의 새로운 방장으로 강제 임명되셨습니다.",
                    "/workspace/" + chatRoomMember.getChatRoom().getWorkSpace().getId() + "/chat",
                    NotificationType.CHAT);
          } else {
              msgReadStatusRepository.deleteByMessage_ChatRoom_Id(chatRoomMember.getChatRoom().getId());
              chatMessageRepository.deleteByChatRoomId(chatRoomMember.getChatRoom().getId());
              chatRoomMemberRepository.deleteByChatRoomId(chatRoomMember.getChatRoom().getId());
              chatRoomRepository.deleteById(chatRoomMember.getChatRoom().getId());
              log.info("채팅방 " + chatRoomMember.getChatRoom().getName() + "가 참여자가 없어서 삭제되었습니다.");
          }
        } else {
//          log.info("방장아님 그냥 나가기: "+ chatRoomMember.getChatRoom().getId());
//          chatRoomMember.setLeft(true);
//          chatRoomMemberRepository.save(chatRoomMember);
          chatRoomMemberRepository.delete(chatRoomMember);
        }
      }
    }
  }


  //탈퇴할 때
//  @Override
//  @Transactional
//  public void deleteChatRoomMember(Long userId){
//    List<WSMember> wsMembers = wsMemberRepository.findAllByUserId(userId);
//    for(WSMember wsMember: wsMembers){
//      List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByWsMemberId(wsMember.getId()); //wsmemberId를 통해 참여하고 있는 모든 채팅방 가져와서
//      //전부 삭제
//      //chatRoomMembers 하나씩 돌려서
//    }
//  }

  //워크스페이스 나갈 때
  //탈퇴랑 타입이든 뭐든 합칠 수 있으면 합치기
  //workspaceid, userid/wsmemberid 받아와서
  //해당 wsid에 참여중인 채팅방 목록을 뽑아냄
  //isLeft 값에 상관없이 뽑아내서 전부 삭제


  @Override
  public boolean existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(Long chatRoomId, Long wsMemberId) {
    return chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId);
  }

  public boolean isChatRoomEmpty(Long chatRoomId) {
    return !chatRoomMemberRepository.existsByChatRoomIdAndIsLeftFalse(chatRoomId);
  }
}
