package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import com.minglers.minglespace.chat.dto.ChatMsgRequestDTO;
import com.minglers.minglespace.chat.dto.ChatMsgResponseDTO;
import com.minglers.minglespace.chat.dto.MessageStatusDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.entity.MsgReadStatus;
import com.minglers.minglespace.chat.exception.ChatException;
import com.minglers.minglespace.chat.repository.ChatMessageRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.chat.repository.MsgReadStatusRepository;
import com.minglers.minglespace.chat.repository.specification.ChatMessageSpecification;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.repository.ImageRepository;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
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
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatMessageServiceImpl implements ChatMessageService {
  private final ChatMessageRepository chatMessageRepository;
  private final ChatRoomRepository chatRoomRepository;
  private final WSMemberRepository wsMemberRepository;
  private final MsgReadStatusRepository msgReadStatusRepository;

  private final MsgReadStatusService msgReadStatusService;
  //알림
  private final CustomHandShakeInterceptor customHandShakeInterceptor;
  private final SimpMessagingTemplate simpMessagingTemplate;
  private final ImageRepository imageRepository;

  // 메시지 저장
  @Override
  @Transactional
  public ChatMsgResponseDTO saveMessage(ChatMsgRequestDTO messageDTO, Long writerUserId, Set<Long> activeUserIds) {
    try {
      ChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getChatRoomId())
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방이 존재하지 않습니다."));

      WSMember wsMember = wsMemberRepository.findByUserIdAndWorkSpaceId(writerUserId, messageDTO.getWorkspaceId())
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "워크스페이스에 해당 유저가 존재하지 않습니다."));

      // 답글이 있는 경우 처리
      ChatMessage parentMsg = null;
      if (messageDTO.getReplyId() != null) {
        parentMsg = chatMessageRepository.findById(messageDTO.getReplyId())
                .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "답글단 댓글 메시지가 존재하지 않습니다."));
      }

      //파일 조회
      List<Image> images = imageRepository.findAllById(messageDTO.getImageIds());

      ChatMessage chatMessage = messageDTO.toEntity(chatRoom, wsMember, parentMsg);
      for(Image image: images){
        chatMessage.addImage(image);
      }
      ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

      //답글이면 부모 댓글에게 답글 달린 알림 보내기
//      if (parentMsg != null) {
//        sendReplyNotificationToUser(parentMsg);
//      }
//
//      //멘션 알림
//      if (messageDTO.getMentionedUserIds() != null && !messageDTO.getMentionedUserIds().isEmpty()) {
//        for (Long mentionedUserId : messageDTO.getMentionedUserIds()) {
//          sendMentionNotificationToUser(wsMember, savedMessage.getChatRoom().getName(), mentionedUserId);
//        }
//      }

      ////msgReadStatus 추가
      msgReadStatusService.createMsgForMembers(savedMessage, activeUserIds);

      //messageDTO 정보 채우기
//      ChatMsgResponseDTO resDTO = ChatMsgResponseDTO.builder()
//              .id(savedMessage.getId())
//              .content(messageDTO.getContent())
//              .writerWsMemberId(wsMember.getId())
//              .chatRoomId(messageDTO.getChatRoomId())
//              .replyId(messageDTO.getReplyId())
//              .date(savedMessage.getDate())
//              .isAnnouncement(messageDTO.getIsAnnouncement())
//              .imageUriPaths(imageUris)
//              .documentUriPaths(documentUris)
//              .build();
      List<MemberWithUserInfoDTO> unreadMembers = getUnreadMembers(messageDTO.getChatRoomId(), savedMessage.getId());
      ChatMsgResponseDTO resDTO = savedMessage.toDTO(unreadMembers);

      resDTO.setUnReadMembers(unreadMembers);

      return resDTO;
    } catch (ChatException e) {
      throw e;
    } catch (RuntimeException e) {
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
  public List<ChatMsgResponseDTO> getMessagesByChatRoom(ChatRoom chatRoom) {
    log.info("getMessagesByChatRoom_chatRoomId : " + chatRoom.getId());
    //채팅방 메시지 가져오기
    List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdAndIsDeletedFalse(chatRoom.getId());
    log.info("getMessagesByChatRoom_ msg : " + messages.get(messages.size() -1 ).getImages().size());

    return messages.stream()
            .map(message -> {
              List<MemberWithUserInfoDTO> unreadMembers = getUnreadMembers(chatRoom.getId(), message.getId());
              return message.toDTO(unreadMembers);
            })
            .collect(Collectors.toList());
  }

  private List<MemberWithUserInfoDTO> getUnreadMembers(Long chatRoomId, Long messageId) {
    List<MsgReadStatus> unreadStatuses = msgReadStatusRepository.findByMessage_ChatRoom_Id(chatRoomId);
    //읽지 않는 메시지들 중에 현 메시지가 일치하는 걸 찾아 해당 메시지를 안읽은 wsMember 정보를 가져온다.
    return unreadStatuses.stream()
            .filter(status -> status.getMessage().getId().equals(messageId))
            .map(status -> wsMemberRepository.findById(status.getWsMember().getId())
                    //아래 map은 Optional 타입인 객체에 값이 존재할 때만 실행하기 때문에 결과 객체를 받자마자 작업을 하기 위해 사용함.
                    .map(member -> {
                      User user = member.getUser();
                      String imageUriPath = (user.getImage() != null && user.getImage().getUripath() != null) ? user.getImage().getUripath() : "";
                      return MemberWithUserInfoDTO.builder()
                              .wsMemberId(member.getId())
                              .userId(user.getId())
                              .email(user.getEmail())
                              .name(user.getName())
                              .imageUriPath(imageUriPath)
                              .position(user.getPosition())
                              .build();
                    }).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
  }


  ///메시지 검색 결과
  @Override
  public List<Long> searchMessages(Long chatRoomId, List<String> keywords) {
    //chatRoomId에 맞는 조건 추가
    Specification<ChatMessage> spec = Specification.where(ChatMessageSpecification.hasChatRoomId(chatRoomId));

    if (keywords != null && !keywords.isEmpty()) {
      //키워드 검색 조건 추가
      spec = spec.and(ChatMessageSpecification.contentContainKeywords(keywords));
    }

    //조건에 맞는 레코드 검색
    List<ChatMessage> msgs = chatMessageRepository.findAll(spec);

    List<Long> resultIds = new ArrayList<>();
    for (ChatMessage msg : msgs) {
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
    try {
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
    } catch (Exception e) {
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "공지 등록 중 오류 발생");
    }
  }

  @Override
  @Transactional
  public String deleteMessage(Long chatRoomId, Long messageId) {
    try {
      int deleted = chatMessageRepository.softDeleteById(messageId);
      if (deleted == 0) {
        throw new ChatException(HttpStatus.NOT_FOUND.value(), "삭제할 메시지가 존재하지 않습니다.");
      }

      MessageStatusDTO messageStatusDTO = MessageStatusDTO.builder()
              .chatRoomId(chatRoomId)
              .messageId(messageId)
              .type("READ")
              .build();

      simpMessagingTemplate.convertAndSend("/topic/chatRooms/" + chatRoomId + "/message-status", messageStatusDTO);
    } catch (Exception e) {
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "메시지 삭제 중 오류 발생: " + e.getMessage());
    }
    return messageId + "번 메시지 삭제 완료";
  }
}
