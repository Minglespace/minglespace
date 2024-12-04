package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.UserService;
import com.minglers.minglespace.chat.dto.*;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.service.ChatMessageService;
import com.minglers.minglespace.chat.service.ChatRoomMemberService;
import com.minglers.minglespace.chat.service.ChatRoomService;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.service.WSMemberService;
import com.minglers.minglespace.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/workspaces/{workspaceId}/chatRooms")
public class ChatRoomController {
  private final ChatRoomService chatRoomService;
  private final ChatRoomMemberService chatRoomMemberService;
  private final ChatMessageService chatMessageService;
  private final WSMemberService wsMemberService;
  private final JWTUtils jwtUtils;


  //채팅방 목록 조회
  @GetMapping("/members")
  public ResponseEntity<List<ChatListResponseDTO>> getRoomsByMember(@PathVariable Long workspaceId,
                                                                    @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom_getRoomByMember - requestUserId : "+ userId);

    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    List<ChatListResponseDTO> chatRooms = chatRoomService.getRoomsByWsMember(workspaceId, wsMemberId);
    return ResponseEntity.ok(chatRooms);
  }

  //방 생성
  @PostMapping("")
  public ResponseEntity<ChatListResponseDTO> createRoom(@PathVariable Long workspaceId,
                                                        @RequestPart("requestDTO") CreateChatRoomRequestDTO requestDTO,
                                                        @RequestPart("image") MultipartFile image,
                                                        @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom_createRoom - requestUserId : "+ userId);

    WSMember createMember = wsMemberService.findByUserIdAndWsId(userId, workspaceId);

    requestDTO.setWorkspaceId(workspaceId);
    requestDTO.setImage(image);
    ChatListResponseDTO chatRoomdto = chatRoomService.createRoom(requestDTO, createMember);
    return ResponseEntity.ok(chatRoomdto);
  }


  //특정 방 조회
  @GetMapping("/{chatRoomId}")
  public ResponseEntity<?> getChatRoomWithMsg(@PathVariable Long workspaceId, @PathVariable Long chatRoomId,
                                              @RequestHeader("Authorization") String authorizationHeader) {

    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom _ getChatRoomWithMsg - requestUserId : "+ userId);

    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    if (!chatRoomMemberService.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body("채팅방 참여 멤버가 아닙니다.");
    }

    ChatRoom chatRoom = chatRoomService.findRoomById(chatRoomId);
    if (chatRoom == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("채팅방이 존재하지 않습니다.");
    }

    //메시지 목록
    List<ChatMessageDTO> messages = chatMessageService.getMessagesByChatRoom(chatRoom);
    //참여자 목록
    List<ChatRoomMemberDTO> participants = chatRoomMemberService.getParticipantsByChatRoomId(chatRoomId);

    String imageUriPath = (chatRoom.getImage() != null && chatRoom.getImage().getUripath() != null) ? chatRoom.getImage().getUripath() : "";


    ChatRoomResponseDTO chatRoomResponseDTO = ChatRoomResponseDTO.builder()
            .chatRoomId(chatRoomId)
            .name(chatRoom.getName())
            .participants(participants)
            .messages(messages)
            .workSpaceId(chatRoom.getWorkSpace().getId())
            .imageUriPath(imageUriPath)
            .build();
    return ResponseEntity.ok(chatRoomResponseDTO);
  }


  //채팅방 멤버 추가
  @PostMapping("/{chatRoomId}/members/{addMemberId}")
  public ResponseEntity<String> addMemberToRoom(@PathVariable Long workspaceId,
                                                @PathVariable Long chatRoomId,
                                                @PathVariable Long addMemberId,
                                                @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom _ addMemberToRoom - requestUserId : "+ userId);

    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    if (!chatRoomMemberService.isRoomLeader(chatRoomId, wsMemberId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body("방장만 멤버를 추가할 수 있습니다.");
    }

    chatRoomMemberService.addUserToRoom(chatRoomId, addMemberId);
    return ResponseEntity.ok("참여자 추가 완료");
  }


  //채팅방 멤버 강퇴
  @DeleteMapping("/{chatRoomId}/members/{kickMemberId}/kick")
  public ResponseEntity<String> kickMemberFromRoom(@PathVariable Long workspaceId,
                                                   @PathVariable Long chatRoomId,
                                                   @PathVariable Long kickMemberId,
                                                   @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom _ kickMemberFromRoom - requestUserId : "+ userId);

    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    if (!chatRoomMemberService.isRoomLeader(chatRoomId, wsMemberId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body("방장만 멤버를 강퇴할 수 있습니다.");
    }

    chatRoomMemberService.kickMemberFromRoom(chatRoomId, kickMemberId);
    return ResponseEntity.ok("참여자 강퇴 완료");
  }

  //자진 방 나가기
  @DeleteMapping("/{chatRoomId}/leave")
  public ResponseEntity<String> leaveChatRoom(@PathVariable Long workspaceId, @PathVariable Long chatRoomId,
                                              @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom _ leaveChatRoom - requestUserId : "+ userId);

    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    chatRoomMemberService.updateIsLeftFromLeave(chatRoomId, wsMemberId);
    return ResponseEntity.ok("채팅방 나가기 완료");
  }

  //방장 위임
  @PatchMapping("/{chatRoomId}/leader/{newLeaderId}")
  public ResponseEntity<String> delegateLeader(@PathVariable Long workspaceId,
                                               @PathVariable Long chatRoomId,
                                               @PathVariable Long newLeaderId,
                                               @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom _ delegateLeader - requestUserId : "+ userId);

    Long currentMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    try {
      chatRoomMemberService.delegateLeader(chatRoomId, newLeaderId, currentMemberId);
      return ResponseEntity.ok("방장 위임 완료");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
  }

}
