package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.type.WithdrawalType;
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
import com.minglers.minglespace.common.service.NotificationService;
import com.minglers.minglespace.common.type.NotificationType;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatMessageServiceImpl implements ChatMessageService {
  private final ChatMessageRepository chatMessageRepository;
  private final ChatRoomRepository chatRoomRepository;
  private final WSMemberRepository wsMemberRepository;
  private final MsgReadStatusRepository msgReadStatusRepository;
  private final ImageRepository imageRepository;

  private final MsgReadStatusService msgReadStatusService;

  private final SimpMessagingTemplate simpMessagingTemplate;


  // 메시지 저장
  @Override
  @Transactional
  public ChatMsgResponseDTO saveMessage(ChatMsgRequestDTO messageDTO, Long writerUserId, Set<Long> activeUserIds) {
    try {
      log.info("writerUserId: " + writerUserId);
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
      for (Image image : images) {
        chatMessage.addImage(image);
      }
      ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

      ////msgReadStatus 추가
      msgReadStatusService.createMsgForMembers(savedMessage, activeUserIds, messageDTO.getMentionedUserIds());

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

  // 방 메시지 가져오기
  @Override
  public Map<String, Object> getMessagesByChatRoom(Long chatRoomId, int page, int size) {
    log.info("getMessagesByChatRoom_chatRoomId : " + chatRoomId);
    //채팅방 메시지 가져오기
    PageRequest pageRequest = PageRequest.of(page, size);
    Page<ChatMessage> messagesPage = chatMessageRepository.findByChatRoomIdAndIsDeletedFalse(chatRoomId, pageRequest);
    log.info("getMessagesByChatRoom_ msg : " + messagesPage.getNumberOfElements());

    List<ChatMsgResponseDTO> messages = messagesPage.getContent().stream()
            .map(message -> {
              List<MemberWithUserInfoDTO> unreadMembers = getUnreadMembers(chatRoomId, message.getId());
              return message.toDTO(unreadMembers);
            })
            .collect(Collectors.toList());
    boolean msgHasMore = messagesPage.getTotalElements() > (page + 1) * size;

    Map<String, Object> response = new HashMap<>();
    response.put("messages", messages);
    response.put("msgHasMore", msgHasMore);
    return response;
  }

  private List<MemberWithUserInfoDTO> getUnreadMembers(Long chatRoomId, Long messageId) {
    List<MsgReadStatus> unreadStatuses = msgReadStatusRepository.findByMessage_ChatRoom_Id(chatRoomId);
    //읽지 않는 메시지들 중에 현 메시지가 일치하는 걸 찾아 해당 메시지를 안읽은 wsMember 정보를 가져온다.
    return unreadStatuses.stream()
            .filter(status -> status.getMessage().getId().equals(messageId))
            .map(status -> {
              if (status.getWsMember() == null) {
                return null;
              }
              return wsMemberRepository.findById(status.getWsMember().getId())
                      //아래 map은 Optional 타입인 객체에 값이 존재할 때만 실행하기 때문에 결과 객체를 받자마자 작업을 하기 위해 사용함.
                      .map(member -> {
                        User user = member.getUser();
                        if (user.getWithdrawalType() != WithdrawalType.NOT) {
                          return null;
                        }
                        String imageUriPath = (user.getImage() != null && user.getImage().getUripath() != null) ? user.getImage().getUripath() : "";
                        return MemberWithUserInfoDTO.builder()
                                .wsMemberId(member.getId())
                                .userId(user.getId())
                                .email(user.getEmail())
                                .name(user.getName())
                                .imageUriPath(imageUriPath)
                                .position(user.getPosition())
                                .build();
                      }).orElse(null);
            })
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

      MessageStatusDTO messageStatusDTO = MessageStatusDTO.builder()
              .chatRoomId(chatRoomId)
              .messageId(messageId)
              .type("ANNOUNCEMENT")
              .build();

      simpMessagingTemplate.convertAndSend("/topic/chatRooms/" + chatRoomId + "/message-status", messageStatusDTO);

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
              .type("DELETE")
              .build();

      simpMessagingTemplate.convertAndSend("/topic/chatRooms/" + chatRoomId + "/message-status", messageStatusDTO);
    } catch (Exception e) {
      throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "메시지 삭제 중 오류 발생: " + e.getMessage());
    }
    return messageId + "번 메시지 삭제 완료";
  }
}
