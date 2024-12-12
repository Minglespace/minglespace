package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.exception.ChatException;
import com.minglers.minglespace.chat.repository.ChatMessageRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.chat.repository.specification.ChatMessageSpecification;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
  public ChatMessage saveMessage(ChatMessageDTO messageDTO, Long writerUserId) {
    try {
      ChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getChatRoomId())
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(),"채팅방이 존재하지 않습니다."));

      WSMember wsMember = wsMemberRepository.findByUserIdAndWorkSpaceId(writerUserId, messageDTO.getWorkspaceId())
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "워크스페이스에 해당 유저가 존재하지 않습니다."));

      messageDTO.setWriterWsMemberId(wsMember.getId());
      messageDTO.setDate(LocalDateTime.now());

      // 답글이 있는 경우 처리
      ChatMessage parentMsg = null;
      if (messageDTO.getReplyId() != null) {
        parentMsg = chatMessageRepository.findById(messageDTO.getReplyId())
                .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "답글단 댓글 메시지가 존재하지 않습니다."));
      }

      ChatMessage chatMessage = messageDTO.toEntity(chatRoom, wsMember, parentMsg);
      ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

      //답글이면 부모 댓글에게 답글 달린 알림 보내기
      if (parentMsg != null) {
        sendReplyNotificationToUser(parentMsg);
      }

      //멘션 알림
      if (messageDTO.getMentionedUserIds() != null && !messageDTO.getMentionedUserIds().isEmpty()) {
        for (Long mentionedUserId : messageDTO.getMentionedUserIds()) {
          sendMentionNotificationToUser(wsMember, savedMessage.getChatRoom().getName(), mentionedUserId);
        }
      }

      return savedMessage;
    }catch (ChatException e){
     throw e;
    }catch (RuntimeException e) {
      log.error("메시지 저장 중 오류 발생 : ", e);
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "메시지 저장 중 오류 발생: " + e.getMessage());
    }
  }

  //답글 알림
  private void sendReplyNotificationToUser(ChatMessage parentMsg) {
    String sessionId = customHandShakeInterceptor.getSessionForUser(parentMsg.getWsMember().getUser().getId());
    simpMessagingTemplate.convertAndSendToUser(sessionId, "/queue/notifications", "타 멤버가 유저의 댓글의 답글을 달았습니다.");
  }

  //멘션 알림
  private void sendMentionNotificationToUser(WSMember sendMember, String mentionedChatName, Long mentionedUserId) {
    String sessionId = customHandShakeInterceptor.getSessionForUser(mentionedUserId);
    String sendUsername = sendMember.getUser().getUsername();
    String notifyMsg = sendUsername + "이 " + mentionedChatName + "채팅방에서 당신을 멘션하였습니다.";
    simpMessagingTemplate.convertAndSendToUser(sessionId, "/queue/notifications", notifyMsg);
  }

  // 방 메시지 가져오기
  @Override
  public List<ChatMessageDTO> getMessagesByChatRoom(ChatRoom chatRoom) {
    log.info("getMessagesByChatRoom_chatRoomId : " + chatRoom.getId());
    List<ChatMessage> messages = chatMessageRepository.findByChatRoomId(chatRoom.getId());
    log.info("getMessagesByChatRoom_ msg : " + messages.size());

    List<ChatMessageDTO> dtos = messages.stream()
            .map(ChatMessage::toDTO)
            .collect(Collectors.toList());
    return dtos;
  }

  ///메시지 검색 결과
  @Override
  public List<Long> searchMessages(Long chatRoomId, List<String> keywords) {
    //chatRoomId에 맞는 조건 추가
    Specification<ChatMessage> spec = Specification.where(ChatMessageSpecification.hasChatRoomId(chatRoomId));

    if (keywords != null && !keywords.isEmpty()){
      //키워드 검색 조건 추가
      spec = spec.and(ChatMessageSpecification.contentContainKeywords(keywords));
    }

    //조건에 맞는 레코드 검색
    List<ChatMessage> msgs = chatMessageRepository.findAll(spec);

    List<Long> resultIds = new ArrayList<>();
    for (ChatMessage msg: msgs){
      resultIds.add(msg.getId());
    }

    return resultIds;
//    return msgs.stream()
//            .map(msg ->{
//              Long replyId = (msg.getParentMessage() != null) ? msg.getParentMessage().getId() : null;
//              return ChatMessageDTO.builder()
//                      .id(msg.getId())
//                      .chatRoomId(msg.getChatRoom().getId())
//                      .date(msg.getDate())
//                      .content(msg.getContent())
//                      .replyId(replyId)
//                      .writerWsMemberId(msg.getWsMember().getId())
//                      .isAnnouncement(msg.getIsAnnouncement())
//                      .build();
//            })
//            .collect(Collectors.toList());
  }

  @Override
  @Transactional
  public String updateAnnouncement(Long chatRoomId, Long messageId) {
    try{
      //기존 공지가 있다면 false
      chatMessageRepository.findByChatRoomIdAndIsAnnouncementTrue(chatRoomId)
              .ifPresent(oldNotice -> {
                oldNotice.setIsAnnouncement(false);
                chatMessageRepository.save(oldNotice);
              });

      chatMessageRepository.findById(messageId).ifPresentOrElse(newNotice -> {
        newNotice.setIsAnnouncement(true);
        chatMessageRepository.save(newNotice);
      }, () -> {
        throw new ChatException(HttpStatus.NOT_FOUND.value(), "공지로 설정할 메시지를 찾지 못했습니다.");
      });
      return "공지 등록 완료";
    }catch (Exception e){
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "공지 등록 중 오류 발생");
    }
  }
}
