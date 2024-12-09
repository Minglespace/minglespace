package com.minglers.minglespace.chat.service;

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
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomServiceImpl implements ChatRoomService {

  private final ChatRoomRepository chatRoomRepository;
  private final ChatRoomMemberRepository chatRoomMemberRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final WorkspaceRepository workspaceRepository;
  private final WSMemberRepository wsMemberRepository;
  private final MsgReadStatusRepository msgReadStatusRepository;

  private final ChatMessageService chatMessageService;
  private final ChatRoomMemberService chatRoomMemberService;

  @Override
  public List<ChatListResponseDTO> getRoomsByWsMember(Long workspaceId, Long wsMemberId) {
    // 채팅방 목록을 얻기 위한
    List<ChatRoomMember> chatRooms = chatRoomMemberRepository.findByChatRoom_WorkSpace_IdAndWsMember_Id(workspaceId, wsMemberId);

    return chatRooms.stream()
            .map(chatRoomMember -> {
              ChatRoom chatRoom = chatRoomMember.getChatRoom();
              String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";

              // 마지막 메시지
              Optional<ChatMessage> lastMessage = chatMessageRepository.findLatestMessageByChatRoomId(chatRoom.getId());
              String lastMsgContent = lastMessage.map(ChatMessage::getContent).orElse("");
              log.info("getRoomsByWsMember_lastMessage: " + lastMsgContent);

              // 참여 인원수
              int participantCount = chatRoomMemberRepository.findByChatRoomIdAndIsLeftFalse(chatRoom.getId()).size();

              //안읽은 메시지
              long notReadMsgCount = msgReadStatusRepository.countByMessage_ChatRoom_IdAndWsMemberId(chatRoom.getId(), wsMemberId);

              return ChatListResponseDTO.builder()
                      .chatRoomId(chatRoom.getId())
                      .name(chatRoom.getName())
                      .imageUriPath(imageUriPath)
                      .workSpaceId(chatRoom.getWorkSpace().getId())
                      .date(chatRoom.getDate())
                      .lastMessage(lastMsgContent)
                      .participantCount(participantCount)
                      .notReadMsgCount(notReadMsgCount)
                      .build();
            }).collect(Collectors.toList());
  }

  @Override
  public ChatRoom findRoomById(Long chatRoomId) {
    return chatRoomRepository.findById(chatRoomId).orElse(null);
  }

  @Override
  @Transactional
  public ChatListResponseDTO createRoom(CreateChatRoomRequestDTO requestDTO, WSMember createMember, Image saveFile) {
    WorkSpace wspace = workspaceRepository.findById(requestDTO.getWorkspaceId())
            .orElseThrow(() -> new ChatException(HttpStatus.NOT_FOUND.value(), "Workspace not found with ID " + requestDTO.getWorkspaceId()));

    // 사진 처리 필요
    ChatRoom chatRoom = ChatRoom.builder()
            .image(saveFile)
            .name(requestDTO.getName())
            .workSpace(wspace)
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

      chatRoom.addChatRoomMember(chatRoomMember);
      chatRoomMemberRepository.save(chatRoomMember);
    }

    String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";

    return ChatListResponseDTO.builder()
            .chatRoomId(chatRoom.getId())
            .name(chatRoom.getName())
            .imageUriPath(imageUriPath)
            .workSpaceId(chatRoom.getWorkSpace().getId())
            .date(chatRoom.getDate())
            .lastMessage("")
            .participantCount(chatRoom.getChatRoomMembers().size()) // 처음 생성이니까 떠난 유저가 없다는 전제
            .build();
  }

  @Override
  @Transactional
  public void deleteChatRoomData(Long chatRoomId) {
    chatMessageRepository.deleteByChatRoomId(chatRoomId);
    chatRoomMemberRepository.deleteByChatRoomId(chatRoomId);
    chatRoomRepository.deleteById(chatRoomId);
  }

  //특정방 정보
  @Override
  public ChatRoomResponseDTO getChatRoomWithMsgAndParticipants(Long chatRoomId, Long workspaceId, Long userId) {
    ChatRoom chatRoom = findRoomById(chatRoomId);
    if (chatRoom == null){
      throw new ChatException(HttpStatus.NOT_FOUND.value(), "채팅방이 존재하지 않습니다.");
    }

    List<ChatMessageDTO> messages = chatMessageService.getMessagesByChatRoom(chatRoom);

    List<ChatRoomMemberDTO> participants = chatRoomMemberService.getParticipantsByChatRoomId(chatRoomId);

    String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";

    return ChatRoomResponseDTO.builder()
            .chatRoomId(chatRoomId)
            .name(chatRoom.getName())
            .participants(participants)
            .messages(messages)
            .workSpaceId(chatRoom.getWorkSpace().getId())
            .imageUriPath(imageUriPath)
            .build();
  }
}
