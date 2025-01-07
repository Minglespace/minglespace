package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import com.minglers.minglespace.chat.dto.ChatListResponseDTO;
import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
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
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
  private final StompInterceptor stompInterceptor;
  private final SimpMessagingTemplate simpMessagingTemplate;

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
              .build();

      chatRoom.addChatRoomMember(chatRoomMember);
      chatRoomMemberRepository.save(chatRoomMember);
    }
    List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalseAndUserWithdrawalTypeNot(chatRoomId);

    this.chatNotification(chatRoom,chatRoomMembers, member.getUser().getId(), "ADD", chatRoom.getChatRoomMembers().size());
    notificationService.sendNotification(member.getUser().getId(), "'" + chatRoom.getName() + "' 채팅방에 초대되었습니다.", "/workspace/" + chatRoom.getWorkSpace().getId() + "/chat", NotificationType.CHAT);

    return "참여자 추가 완료";
  }

  @Override
  @Transactional
  public String kickMemberFromRoom(Long chatRoomId, Long wsMemberId) {
    List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalseAndUserWithdrawalTypeNot(chatRoomId);

    ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방을 찾지 못했습니다."));
    WSMember wsMember = wsMemberRepository.findById(wsMemberId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "강퇴할 멤버를 찾지 못했습니다."));

    chatRoomMemberRepository.updateIsLeftStatus(true, chatRoomId, wsMemberId);

    this.chatNotification(chatRoom, chatRoomMembers, wsMember.getUser().getId(), "DELETE", chatRoom.getChatRoomMembers().size() - 1);

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

  //탈퇴 신청 시 > 모든 워크스페이스 찾기
  @Override
  @Transactional
  public void forceDelegateLeader(Long userId) {
    List<WSMember> wsMembers = wsMemberRepository.findAllByUserId(userId);
    for (WSMember wsMember : wsMembers) {
      this.forceDelegateLeaderByWorkspaceId(wsMember.getId(), wsMember.getWorkSpace().getId());
    }
  }

  //특정 워크스페이스 내 채팅방장 강제 위임
  @Override
  @Transactional
  public void forceDelegateLeaderByWorkspaceId(Long wsMemberId, Long workSpaceId) {
    List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByChatRoom_WorkSpace_IdAndWsMember_IdAndIsLeftFalseOrderByChatRoom_DateDesc(workSpaceId, wsMemberId);

    for (ChatRoomMember chatRoomMember : chatRoomMembers) {
      if (this.isRoomLeader(chatRoomMember.getChatRoom().getId(), wsMemberId)) {
//          log.info("방장이어서 위임해야함: "+ chatRoomMember.getChatRoom().getId());
        List<ChatRoomMember> roomMembers = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalseAndUserWithdrawalTypeNot(chatRoomMember.getChatRoom().getId());
        if (roomMembers.size() > 1) {
          ChatRoomMember newLeader = roomMembers.stream()
                  .filter(member -> !member.getWsMember().getId().equals(wsMemberId))
                  .findFirst()
                  .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "새로운 방장 후보가 없습니다."));

          chatRoomMember.setChatRole(ChatRole.CHATMEMBER);
          newLeader.setChatRole(ChatRole.CHATLEADER);

          chatRoomMemberRepository.save(chatRoomMember); //탈퇴 신청 시
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
      }
    }
  }

  //탈퇴하면 읽음, 참여 기록 삭제
  @Override
  @Transactional
  public void deleteByUserId(Long userId) {
    msgReadStatusRepository.deleteByWsMember_UserId(userId);
    chatRoomMemberRepository.deleteByWsMember_UserId(userId);
  }

  @Override
  public boolean existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(Long chatRoomId, Long wsMemberId) {
    return chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId);
  }

  @Override
  public boolean isChatRoomEmpty(Long chatRoomId) {
    return !chatRoomMemberRepository.existsByChatRoomIdAndIsLeftFalse(chatRoomId);
  }

  private void chatNotification(ChatRoom chatRoom, List<ChatRoomMember> chatRoomMembers, Long targetUserId, String type, int participantCount){
    String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";
    Optional<ChatMessage> lastMessage = chatMessageRepository.findLatestMessageByChatRoomId(chatRoom.getId());
    String lastMsgContent = lastMessage
            .map(ChatMessage::getContent) // 메시지가 있으면 content 가져옴
            .map(content -> content.isEmpty() ? "(파일)" : content)
            .orElse(null);

    for(ChatRoomMember chatRoomMember : chatRoomMembers){
      ChatListResponseDTO responseDTO = ChatListResponseDTO.builder()
              .chatRoomId(chatRoom.getId())
              .name(chatRoom.getName())
              .imageUriPath(imageUriPath)
              .workSpaceId(chatRoom.getWorkSpace().getId())
              .date(chatRoom.getDate())
              .participantCount(participantCount)
              .lastMessage(lastMsgContent)
              .type(type)
              .targetUserId(targetUserId)
              .build();
      Set<String> sessionIds = stompInterceptor.getSessionForUser(chatRoomMember.getWsMember().getUser().getId());
      if(sessionIds != null && !sessionIds.isEmpty()){
        sessionIds.forEach(sessionId -> {
          String cleanSession = sessionId.replaceAll("[\\[\\]]", "");
          SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
          headerAccessor.setSessionId(cleanSession);
          headerAccessor.setLeaveMutable(true);
          simpMessagingTemplate.convertAndSendToUser(cleanSession,"/queue/workspaces/"+responseDTO.getWorkSpaceId()+"/chat", responseDTO, headerAccessor.getMessageHeaders());
        });
      }
    }

  }
}
