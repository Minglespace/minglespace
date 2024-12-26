package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import com.minglers.minglespace.chat.dto.*;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.chat.exception.ChatException;
import com.minglers.minglespace.chat.repository.ChatMessageRepository;
import com.minglers.minglespace.chat.repository.ChatRoomMemberRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.chat.repository.MsgReadStatusRepository;
import com.minglers.minglespace.chat.role.ChatRole;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import com.minglers.minglespace.common.service.NotificationService;
import com.minglers.minglespace.common.type.NotificationType;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomServiceImpl implements ChatRoomService {

  private final ChatRoomRepository chatRoomRepository;
  private final ChatRoomMemberRepository chatRoomMemberRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final WSMemberRepository wsMemberRepository;
  private final MsgReadStatusRepository msgReadStatusRepository;

  private final ChatMessageService chatMessageService;
  private final ChatRoomMemberService chatRoomMemberService;
  private final ImageService imageService;
  private final NotificationService notificationService;

  private final StompInterceptor stompInterceptor;
  private final SimpMessagingTemplate simpMessagingTemplate;

  @Override
  public List<ChatListResponseDTO> getRoomsByWsMember(Long workspaceId, Long userId) {

    WSMember wsMember = wsMemberRepository.findByUserIdAndWorkSpaceId(userId, workspaceId).orElseThrow(() -> new ChatException(HttpStatus.FORBIDDEN.value(), "워크스페이스 참여하는 유저가 아닙니다."));

    // 채팅방 목록을 얻기 위한
    List<ChatRoomMember> chatRooms = chatRoomMemberRepository.findByChatRoom_WorkSpace_IdAndWsMember_IdAndIsLeftFalseOrderByChatRoom_DateDesc(workspaceId, wsMember.getId());

    return chatRooms.stream()
            .map(chatRoomMember -> {
              ChatRoom chatRoom = chatRoomMember.getChatRoom();
              String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";

              // 마지막 메시지
              Optional<ChatMessage> lastMessage = chatMessageRepository.findLatestMessageByChatRoomId(chatRoom.getId());
              String lastMsgContent = lastMessage
                      .map(ChatMessage::getContent) // 메시지가 있으면 content 가져옴
                      .map(content -> content.isEmpty() ? "(파일)" : content)
                      .orElse(null);
              LocalDateTime lastMsgDate = lastMessage.map(ChatMessage::getDate).orElse(chatRoom.getDate());
//              log.info("getRoomsByWsMember_lastMessage: " + lastMsgContent);

              // 참여 인원수
              int participantCount = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalse(chatRoom.getId()).size();

              //안읽은 메시지
              long notReadMsgCount = msgReadStatusRepository.countByMessage_ChatRoom_IdAndWsMemberId(chatRoom.getId(), wsMember.getId());

              return ChatListResponseDTO.builder()
                      .chatRoomId(chatRoom.getId())
                      .name(chatRoom.getName())
                      .imageUriPath(imageUriPath)
                      .workSpaceId(chatRoom.getWorkSpace().getId())
                      .date(chatRoom.getDate())
                      .lastMessage(lastMsgContent)
                      .participantCount(participantCount)
                      .notReadMsgCount(notReadMsgCount)
                      .lastLogDate(lastMsgDate)
                      .build();
            })
            .sorted(Comparator.comparing(ChatListResponseDTO::getLastLogDate).reversed())
            .collect(Collectors.toList());
  }

  @Override
  public ChatRoom findRoomById(Long chatRoomId) {
    return chatRoomRepository.findById(chatRoomId).orElse(null);
  }

  @Override
  @Transactional
  public ChatListResponseDTO createRoom(CreateChatRoomRequestDTO requestDTO, Long userId, MultipartFile image) {

    WSMember createMember = wsMemberRepository.findByUserIdAndWorkSpaceId(userId, requestDTO.getWorkspaceId())
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "워크스페이스에 참여하는 유저가 아닙니다."));

    Image saveFile = null;
    if (image != null) {
      try {
        saveFile = imageService.uploadImage(image);
      } catch (RuntimeException | IOException e) {
        throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "채팅방 이미지 업로드 실패 : " + e.getMessage());  // 업로드 실패 시 처리
      }
    }

    // 사진 처리 필요
    ChatRoom chatRoom = ChatRoom.builder()
            .image(saveFile)
            .name(requestDTO.getName())
            .workSpace(createMember.getWorkSpace())
            .date(LocalDateTime.now())
            .build();

    chatRoom = chatRoomRepository.save(chatRoom);
    log.info("createRoom_ newRoomId: " + chatRoom.getId());

    ChatRoomMember creatorChatRoomMember = ChatRoomMember.builder()
            .chatRoom(chatRoom)
            .wsMember(createMember)
            .chatRole(ChatRole.CHATLEADER)
            .date(LocalDateTime.now())
            .build();

    chatRoom.addChatRoomMember(creatorChatRoomMember);
    chatRoomMemberRepository.save(creatorChatRoomMember);

    List<Long> participantsUserIds = new ArrayList<>();
    // 일반 멤버 추가
    for (Long memberId : requestDTO.getParticipantIds()) {
      WSMember member = wsMemberRepository.findById(memberId)
              .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "Member not found"));

      ChatRoomMember chatRoomMember = ChatRoomMember.builder()
              .chatRoom(chatRoom)
              .wsMember(member)
              .chatRole(ChatRole.CHATMEMBER)
              .date(LocalDateTime.now())
              .build();
      participantsUserIds.add(member.getUser().getId());
      chatRoom.addChatRoomMember(chatRoomMember);
      chatRoomMemberRepository.save(chatRoomMember);
    }

    String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";

    ChatListResponseDTO responseDTO = ChatListResponseDTO.builder()
            .chatRoomId(chatRoom.getId())
            .name(chatRoom.getName())
            .imageUriPath(imageUriPath)
            .workSpaceId(chatRoom.getWorkSpace().getId())
            .date(chatRoom.getDate())
            .lastMessage("")
            .participantCount(chatRoom.getChatRoomMembers().size())
            .notReadMsgCount(0)
            .build();

    //새 채팅방 바로 실시간 알림
    for(Long id: participantsUserIds){
      Set<String> sessionIds = stompInterceptor.getSessionForUser(id);
      if(sessionIds != null && !sessionIds.isEmpty()){
        sessionIds.forEach(sessionId -> {
          String cleanSession = sessionId.replaceAll("[\\[\\]]", "");
          SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
          headerAccessor.setSessionId(cleanSession);
          headerAccessor.setLeaveMutable(true);
          simpMessagingTemplate.convertAndSendToUser(cleanSession,"/queue/workspaces/"+responseDTO.getWorkSpaceId()+"/chat", responseDTO,headerAccessor.getMessageHeaders());
        });
      }
      notificationService.sendNotification(id, responseDTO.getName()+"채팅방에 초대되셨습니다.", "/workspaces/"+responseDTO.getWorkSpaceId()+"/chat", NotificationType.CHAT);
    }
    return responseDTO;
  }

  @Override
  @Transactional
  public void deleteChatRoomData(Long chatRoomId) {
    msgReadStatusRepository.deleteByMessage_ChatRoom_Id(chatRoomId);
    chatMessageRepository.deleteByChatRoomId(chatRoomId);
    chatRoomMemberRepository.deleteByChatRoomId(chatRoomId);
    chatRoomRepository.deleteById(chatRoomId);
  }

  //특정방 정보
  @Override
  public ChatRoomResponseDTO getChatRoomWithMsgAndParticipants(Long chatRoomId, Long workspaceId, Long userId) {
    ChatRoom chatRoom = findRoomById(chatRoomId);
    if (chatRoom == null) {
      throw new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방이 존재하지 않습니다.");
    }

    WSMember wsMember = wsMemberRepository.findByUserIdAndWorkSpaceId(userId, workspaceId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "워크스페이스 멤버에서 찾을 수 없습니다."));

    if (!chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMember.getId())) {
      throw new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방에 참여중이지 않습니다.");
    }

    msgReadStatusRepository.deleteByMessage_ChatRoom_IdAndWsMemberId(chatRoomId, wsMember.getId()); //요청 유저가 안 읽은 메시지가 있다면 읽음 처리하기.

    notifyReadStatus(chatRoomId, wsMember.getId()); //읽음 처리 알림보내기

    Map<String, Object> messagesResponse = chatMessageService.getMessagesByChatRoom(chatRoomId, 0, 50);
    List<ChatMsgResponseDTO> messages = (List<ChatMsgResponseDTO>) messagesResponse.get("messages");
    boolean msgHasMore = (boolean) messagesResponse.get("msgHasMore");
    List<ChatRoomMemberDTO> participants = chatRoomMemberService.getParticipantsByChatRoomId(chatRoomId);

    String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";

    return ChatRoomResponseDTO.builder()
            .chatRoomId(chatRoomId)
            .name(chatRoom.getName())
            .participants(participants)
            .messages(messages)
            .workSpaceId(chatRoom.getWorkSpace().getId())
            .imageUriPath(imageUriPath)
            .msgHasMore(msgHasMore)
            .build();


  }

  @Override
  public Map<String, Object> updateChatRoom(Long chatRoomId, String name, MultipartFile image, String isImageDelete) {
    ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "수정할 채팅방을 찾지 못했습니다."));
    if (name != null && !name.isEmpty()) {
      chatRoom.setName(name);
    }
    Image savedImage = chatRoom.getImage();
    log.info("이미지가 null인가: " + image);

    if ("true".equals(isImageDelete)) {
      if (image != null && !image.isEmpty()) {
        try {
          if (savedImage != null) {
            // 기존 이미지가 있으면 업데이트
            savedImage = imageService.updateImage(savedImage, image);
          } else {
            // 기존 이미지가 없으면 새 이미지 업로드
            savedImage = imageService.uploadImage(image);
          }
          chatRoom.setImage(savedImage);
        } catch (IOException e) {
          throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "채팅방 이미지 수정 중 오류 발생: " + e.getMessage());
        }
      } else if (image == null || image.isEmpty()) {
        if (savedImage != null) {
          try {
            log.info("기존 이미지 삭제 중...");
            imageService.deleteImage(savedImage);
            chatRoom.setImage(null);  // 이미지 필드를 null로 설정
          } catch (IOException e) {
            throw new ChatException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "이미지 삭제 중 오류 발생: " + e.getMessage());
          }
        }
      }
    }

    chatRoomRepository.save(chatRoom);

    Map<String, Object> response = new HashMap<>();
    response.put("chatRoomId", chatRoomId);
    response.put("name", name != null && !name.isEmpty() ? name : chatRoom.getName());
    response.put("imageUriPath", chatRoom.getImage() != null ? chatRoom.getImage().getUripath() : null);
    return response;
  }

  private void notifyReadStatus(Long chatRoomId, Long wsMemberId) {
    MessageStatusDTO messageStatusDTO = MessageStatusDTO.builder()
            .chatRoomId(chatRoomId)
            .wsMemberId(wsMemberId)
            .type("READ")
            .build();

    simpMessagingTemplate.convertAndSend("/topic/chatRooms/" + chatRoomId + "/message-status", messageStatusDTO);
  }
}
