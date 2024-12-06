package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.chat.dto.*;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.service.ChatMessageService;
import com.minglers.minglespace.chat.service.ChatRoomMemberService;
import com.minglers.minglespace.chat.service.ChatRoomService;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.service.WSMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/workspaces/{workspaceId}/chatRooms")
public class ChatRoomController {
  private final ChatRoomService chatRoomService;
  private final ChatRoomMemberService chatRoomMemberService;
  private final ChatMessageService chatMessageService;
  private final WSMemberService wsMemberService;
  private final ImageService imageService;
  private final JWTUtils jwtUtils;


  //채팅방 목록 조회
  @GetMapping("/members")
  public ResponseEntity<?> getRoomsByMember(@PathVariable Long workspaceId,
                                                                    @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom_getRoomByMember - requestUserId : "+ userId);

    WSMember wsMember = wsMemberService.findByUserIdAndWsId(userId, workspaceId);
    if (wsMember == null){
      log.info("getRoom_ requestUser_ not participant");
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new HashMap<String, String>(){{
        put("error", "워크스페이스에 참여하는 유저가 아닙니다.");
      }});
    }

    List<ChatRoomDTO.ListResponse> chatRooms = chatRoomService.getRoomsByWsMember(workspaceId, wsMember.getId());
    return ResponseEntity.ok(chatRooms);
  }

  //방 생성
  @PostMapping("")
  public ResponseEntity<ChatRoomDTO.ListResponse> createRoom(@PathVariable Long workspaceId,
                                                        @RequestPart("requestDTO") ChatRoomDTO.CreateRequest requestDTO,
                                                        @RequestPart("image") MultipartFile image,
                                                        @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);
    log.info("chatRoom_createRoom - requestUserId : "+ userId);

    WSMember createMember = wsMemberService.findByUserIdAndWsId(userId, workspaceId);

    requestDTO.setWorkspaceId(workspaceId);
    Image saveFile = null;
    try{
      saveFile = imageService.uploadImage(image);
    }catch (RuntimeException | IOException e) {
      log.error("Image upload failed: " + e.getMessage(), e);
      throw new RuntimeException("채팅방 이미지 업로드 실패 : ", e);  // 업로드 실패 시 처리
    }

//    requestDTO.setImage(image);
    ChatRoomDTO.ListResponse chatRoomdto = chatRoomService.createRoom(requestDTO, createMember, saveFile);
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


    ChatRoomDTO.RoomResponse chatRoomResponseDTO = ChatRoomDTO.RoomResponse.builder()
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

    boolean isChatRoomEmpty = !chatRoomMemberService.isChatRoomEmpty(chatRoomId);
    if (isChatRoomEmpty) {
      chatRoomService.deleteChatRoomData(chatRoomId);
    }

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
