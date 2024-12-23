package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.chat.exception.ChatException;
import com.minglers.minglespace.chat.repository.ChatRoomMemberRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.chat.role.ChatRole;
import com.minglers.minglespace.common.service.NotificationService;
import com.minglers.minglespace.common.type.NotificationType;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomMemberServiceImpl implements ChatRoomMemberService {
  private final ChatRoomMemberRepository chatRoomMemberRepository;
  private final ChatRoomRepository chatRoomRepository;
  private final WSMemberRepository wsMemberRepository;
  private final NotificationService notificationService;

  @Override
  @Transactional
  public void updateIsLeftFromLeave(Long chatRoomId, Long wsMemberId) {
//        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow(() -> new RuntimeException("해당하는 채팅방이 없습니다.."));
//        WSMember member = wsMemberRepository.findById(wsMemberId).orElseThrow(() -> new RuntimeException("해당하는 멤버가 없습니다. "));

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
    notificationService.sendNotification(member.getUser().getId(),"'"+ chatRoom.getName() + "' 채팅방에 초대되었습니다.", "/workspace/"+chatRoom.getWorkSpace().getId()+"/chat" ,NotificationType.CHAT);

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
    notificationService.sendNotification(wsMember.getUser().getId(),"'"+ chatRoom.getName() + "' 채팅방에서 강퇴되었습니다.", "/workspace/"+chatRoom.getWorkSpace().getId()+"/chat" ,NotificationType.CHAT);
    return "참여자 강퇴 완료";
  }

  @Override
  public List<ChatRoomMemberDTO> getParticipantsByChatRoomId(Long chatRoomId) {
    List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalse(chatRoomId);

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
    try{
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
              "'"+ chatRoom.getName() + "' 채팅방의 새로운 방장으로 임명되셨습니다.",
              "/workspace/"+chatRoom.getWorkSpace().getId()+"/chat",
              NotificationType.CHAT);
    }catch (ChatException e){
      throw  e;
    }catch(Exception e){
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "방장 위임 중 오류 발생");
    }
    return "방장 위임 완료";
  }

  @Override
  public boolean existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(Long chatRoomId, Long wsMemberId) {
    return chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId);
  }

  public boolean isChatRoomEmpty(Long chatRoomId){
    return !chatRoomMemberRepository.existsByChatRoomIdAndIsLeftFalse(chatRoomId);
  }
}
