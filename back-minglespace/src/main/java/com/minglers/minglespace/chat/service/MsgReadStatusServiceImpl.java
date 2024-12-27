package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.MessageStatusDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.chat.entity.MsgReadStatus;
import com.minglers.minglespace.chat.exception.ChatException;
import com.minglers.minglespace.chat.repository.ChatRoomMemberRepository;
import com.minglers.minglespace.chat.repository.MsgReadStatusRepository;
import com.minglers.minglespace.common.service.NotificationService;
import com.minglers.minglespace.common.type.NotificationType;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.service.WSMemberService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class MsgReadStatusServiceImpl implements MsgReadStatusService {
  private final MsgReadStatusRepository msgReadStatusRepository;
  private final ChatRoomMemberRepository chatRoomMemberRepository;
  private final WSMemberRepository wsMemberRepository;
  private final NotificationService notificationService;

  private final SimpMessagingTemplate simpMessagingTemplate;


  @Override
  @Transactional
  public void createMsgForMembers(ChatMessage saveMsg, Set<Long> activeUserIds, List<Long> mentionedIds) {
    try {
      List<ChatRoomMember> members = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalse(saveMsg.getChatRoom().getId());

      if (members.isEmpty()) {
        throw new ChatException(HttpStatus.NOT_FOUND.value(), "메시지 저장하는 채팅방에 멤버가 없습니다.");
      }

      List<MsgReadStatus> list = members.stream()
              .filter(member -> !activeUserIds.contains(member.getWsMember().getUser().getId()))
              .map(member -> MsgReadStatus.builder()
                      .message(saveMsg)
                      .wsMember(member.getWsMember())
                      .build())
              .collect(Collectors.toList());

      msgReadStatusRepository.saveAll(list);

      for (ChatRoomMember member : members) {
        Long memberId = member.getWsMember().getUser().getId();

        if(activeUserIds.contains(memberId)){
          continue;
        }

        String path = "/workspace/" + saveMsg.getChatRoom().getWorkSpace().getId() + "/chat";
        boolean isMentioned = mentionedIds.contains(memberId);
        //작성 유저 제외
        if (!member.getWsMember().getId().equals(saveMsg.getWsMember().getId())) {
          // 멘션 유저 아님
          if (!isMentioned) {
            notificationService.sendNotification(memberId, saveMsg.getWsMember().getWorkSpace().getName()+"에서 새로운 메시지가 있습니다.",
                    path, NotificationType.CHAT_NEW_MESSAGE);
          }else {
            String notifyMsg = saveMsg.getWsMember().getUser().getName() + "님께서 '" + saveMsg.getChatRoom().getName() + "' 채팅방에서 당신을 언급하였습니다.";
            notificationService.sendNotification(memberId, notifyMsg, path, NotificationType.CHAT);
          }

        }
      }

    } catch (Exception e) {
      log.error("메시지 읽음 처리 테이블에 저장 중 오류 발생: "+ e.getMessage());
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "메시지 읽음 처리 테이블에 저장 중 오류 발생");
    }

  }

  @Override
  @Transactional
  public String deleteMsgReadStatus(Long chatRoomId, Long userId, Long workspaceId) {
    try {
      WSMember wsMember = wsMemberRepository.findByUserIdAndWorkSpaceId(userId, workspaceId)
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "워크 스페이스 멤버가 아닙니다."));
      long deletedCount = msgReadStatusRepository.deleteByMessage_ChatRoom_IdAndWsMemberId(chatRoomId, wsMember.getId());
//      if(deletedCount > 0){
//        MessageStatusDTO messageStatusDTO = MessageStatusDTO.builder()
//                .chatRoomId(chatRoomId)
//                .wsMemberId(wsMember.getId())
//                .type("READ")
//                .build();
//        simpMessagingTemplate.convertAndSend("/topic/chatRooms/" + chatRoomId + "/message-status", messageStatusDTO);
//      }
      log.info("Messages marked as read and deleted for chat room ID: " + chatRoomId + " and user ID: " + wsMember.getId());

    } catch (Exception e) {
      log.error("Error occurred while deleting message read status: ", e);
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "메시지 읽음 처리 삭제 중 오류 발생");  // 예외를 던짐
    }
    return "OK";
  }

}
