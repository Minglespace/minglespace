package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.chat.service.MsgReadStatusService;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.service.WSMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/workspaces/{workspaceId}/chatRooms/{chatRoomId}")
public class MsgReadStatusController {
  private final MsgReadStatusService msgReadStatusService;
  private final WSMemberService wsMemberService;
  private final JWTUtils jwtUtils;

  //메시지 읽음 처리 - 삭제
  @DeleteMapping("/readMsg")
  public ResponseEntity<String> deleteMsgReadStatus(@PathVariable("workspaceId") Long workspaceId,
                                                    @PathVariable("chatRoomId") Long chatRoomId,
                                                    @RequestHeader("Authorization") String authorizationHeader) {
    String token = authorizationHeader.replace("Bearer ", "");

    Long userId = jwtUtils.extractUserId(token);

    WSMember wsMember = wsMemberService.findByUserIdAndWsId(userId, workspaceId);

    msgReadStatusService.deleteMsgReadStatus(chatRoomId, wsMember.getId());

    return ResponseEntity.ok("OK");
  }
}
