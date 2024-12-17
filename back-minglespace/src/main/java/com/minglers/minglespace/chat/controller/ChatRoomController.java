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
import org.springframework.security.core.parameters.P;
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
  private final WSMemberService wsMemberService;
  private final ImageService imageService;
  private final JWTUtils jwtUtils;


  //채팅방 목록 조회
  @GetMapping("/members")
  public ResponseEntity<?> getRoomsByMember(@PathVariable Long workspaceId,
                                            @RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(chatRoomService.getRoomsByWsMember(workspaceId, userId));
  }

  //방 생성
  @PostMapping("")
  public ResponseEntity<ChatListResponseDTO> createRoom(@PathVariable Long workspaceId,
                                                             @RequestPart("requestDTO") CreateChatRoomRequestDTO requestDTO,
                                                             @RequestPart(value = "image", required = false) MultipartFile image,
                                                             @RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    requestDTO.setWorkspaceId(workspaceId);

    return ResponseEntity.ok(chatRoomService.createRoom(requestDTO, userId, image));
  }


  //특정 방 조회
  @GetMapping("/{chatRoomId}")
  public ResponseEntity<?> getChatRoomWithMsg(@PathVariable Long workspaceId, @PathVariable Long chatRoomId,
                                              @RequestHeader("Authorization") String token) {

    Long userId = jwtUtils.extractUserId(token.substring(7));
    try{
      ChatRoomResponseDTO chatRoomResponseDTO = chatRoomService.getChatRoomWithMsgAndParticipants(chatRoomId, workspaceId, userId);
      return ResponseEntity.ok(chatRoomResponseDTO);
    }catch (RuntimeException e){
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
  }


  //채팅방 멤버 추가
  @PostMapping("/{chatRoomId}/members/{addMemberId}")
  public ResponseEntity<String> addMemberToRoom(@PathVariable Long workspaceId,
                                                @PathVariable Long chatRoomId,
                                                @PathVariable Long addMemberId,
                                                @RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    if (!chatRoomMemberService.isRoomLeader(chatRoomId, wsMemberId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body("방장만 멤버를 추가할 수 있습니다.");
    }


    return ResponseEntity.ok(chatRoomMemberService.addUserToRoom(chatRoomId, addMemberId));
  }


  //채팅방 멤버 강퇴
  @DeleteMapping("/{chatRoomId}/members/{kickMemberId}/kick")
  public ResponseEntity<String> kickMemberFromRoom(@PathVariable Long workspaceId,
                                                   @PathVariable Long chatRoomId,
                                                   @PathVariable Long kickMemberId,
                                                   @RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    if (!chatRoomMemberService.isRoomLeader(chatRoomId, wsMemberId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body("방장만 멤버를 강퇴할 수 있습니다.");
    }

    return ResponseEntity.ok(chatRoomMemberService.kickMemberFromRoom(chatRoomId, kickMemberId));
  }

  //자진 방 나가기
  @DeleteMapping("/{chatRoomId}/leave")
  public ResponseEntity<String> leaveChatRoom(@PathVariable Long workspaceId, @PathVariable Long chatRoomId,
                                              @RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    Long wsMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    chatRoomMemberService.updateIsLeftFromLeave(chatRoomId, wsMemberId);

    //방에 아무도 없으면 폭파
    if (!chatRoomMemberService.isChatRoomEmpty(chatRoomId)) {
      chatRoomService.deleteChatRoomData(chatRoomId);
    }

    return ResponseEntity.ok("채팅방 나가기 완료");
  }

  //방장 위임
  @PutMapping("/{chatRoomId}/leader/{newLeaderId}")
  public ResponseEntity<String> delegateLeader(@PathVariable Long workspaceId,
                                               @PathVariable Long chatRoomId,
                                               @PathVariable Long newLeaderId,
                                               @RequestHeader("Authorization") String token) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    Long currentMemberId = wsMemberService.findByUserIdAndWsId(userId, workspaceId).getId();

    return ResponseEntity.ok(chatRoomMemberService.delegateLeader(chatRoomId, newLeaderId, currentMemberId));
  }

}
