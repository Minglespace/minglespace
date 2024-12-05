package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.repository.ChatMessageRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatMessageServiceImpl implements ChatMessageService {
  private final ChatMessageRepository chatMessageRepository;
  private final ChatRoomRepository chatRoomRepository;
  private final WSMemberRepository wsMemberRepository;
  //알림
  private final CustomHandShakeInterceptor customHandShakeInterceptor;
  private final SimpMessagingTemplate simpMessagingTemplate;

  // 메시지 저장
  @Override
  public Long saveMessage(ChatMessageDTO messageDTO) {
    try {
      ChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getChatRoomId()).orElseThrow(() -> new RuntimeException("채팅방이 존재하지 않습니다."));
      WSMember wsMember = wsMemberRepository.findById(messageDTO.getWriter()).orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));

      // 답글이 있는 경우 처리
      ChatMessage parentMsg = null;
      if (messageDTO.getReplyId() != null) {
        parentMsg = chatMessageRepository.findById(messageDTO.getReplyId())
                .orElseThrow(() -> new RuntimeException("답글단 댓글 메시지가 존재하지 않습니다."));
      }
      ChatMessage chatMessage = ChatMessage.builder()
              .content(messageDTO.getContent())
              .wsMember(wsMember)
              .chatRoom(chatRoom)
              .parentMessage(parentMsg)
              .date(LocalDateTime.now())
              .build();
      ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

      //답글이면 부모 댓글에게 답글 달린 알림 보내기
      if (parentMsg != null) {
        sendReplyNotificationToUser(savedMessage);
      }

      //멘션 알림
      if (messageDTO.getMentionedUserIds() != null && !messageDTO.getMentionedUserIds().isEmpty()){
        for (Long mentionedUserId : messageDTO.getMentionedUserIds()){
          sendMentionNotificationToUser(wsMember, savedMessage.getChatRoom().getName(), mentionedUserId);
        }
      }

      return savedMessage.getId();
    } catch (RuntimeException e) {
      log.error("메시지 저장 중 오류 발생 : ", e);
      throw e; //클라이언트에게 오류 던짐
    }

  }

  //답글 알림
  private void sendReplyNotificationToUser(ChatMessage parentMsg) {
    String sessionId = customHandShakeInterceptor.getSessionForUser(parentMsg.getWsMember().getUser().getId());
    simpMessagingTemplate.convertAndSendToUser(sessionId, "/queue/notifications", "타 멤버가 유저의 댓글의 답글을 달았습니다.");
  }

  //멘션 알림
  private void sendMentionNotificationToUser(WSMember sendMember,String mentionedChatName, Long mentionedUserId){
    String sessionId = customHandShakeInterceptor.getSessionForUser(mentionedUserId);
    String sendUsername = sendMember.getUser().getUsername();
    String notifyMsg = sendUsername+"이 "+mentionedChatName+"채팅방에서 당신을 멘션하였습니다.";
    simpMessagingTemplate.convertAndSendToUser(sessionId, "/queue/notifications", notifyMsg);
  }

  // 방 메시지 가져오기
  @Override
  public List<ChatMessageDTO> getMessagesByChatRoom(ChatRoom chatRoom) {
    log.info("getMessagesByChatRoom_chatRoomId : " + chatRoom);
    List<ChatMessage> messages = chatMessageRepository.findByChatRoom(chatRoom);
    log.info("getMessagesByChatRoom_ msg : " + messages);

    List<ChatMessageDTO> dtos = messages.stream()
            .map(msg -> {
              Long replyId = (msg.getParentMessage() != null) ? msg.getParentMessage().getId() : null;
              return ChatMessageDTO.builder()
                      .id(msg.getId())
                      .chatRoomId(msg.getChatRoom().getId())
                      .date(msg.getDate())
                      .content(msg.getContent())
                      .replyId(replyId)
                      .writer(msg.getWsMember().getId())
                      .build();
            })
            .collect(Collectors.toList());
    return dtos;
  }
}
