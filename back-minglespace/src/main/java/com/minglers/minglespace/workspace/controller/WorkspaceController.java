package com.minglers.minglespace.workspace.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.workspace.dto.*;
import com.minglers.minglespace.workspace.service.WSMemberService;
import com.minglers.minglespace.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
public class WorkspaceController {

  private final WorkspaceService workspaceService;
  private final WSMemberService wsMemberService;

  private final JWTUtils jwtUtils;

  //사이드바에서 workspace 클릭시 보여주는 리스트
  @GetMapping("")
  public ResponseEntity<List<WorkSpaceResponseDTO>> list(@RequestHeader("Authorization") String token){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(workspaceService.getList(userId));
  }

  //workspace 추가
  @PostMapping("")
  public ResponseEntity<WorkSpaceResponseDTO> register(@RequestHeader("Authorization") String token,
                                                       @RequestBody WorkspaceRequestDTO workSpaceDTO){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(workspaceService.resister(userId,workSpaceDTO));
  }

  //workspace 수정
  @PutMapping("/{workspaceId}")
  public ResponseEntity<WorkSpaceResponseDTO> modify(@RequestHeader("Authorization") String token,
                                                     @PathVariable("workspaceId") Long workspaceId,
                                                     @RequestBody WorkspaceRequestDTO workSpaceDTO){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeader(userId,workspaceId);
    return ResponseEntity.ok(workspaceService.modify(workspaceId,workSpaceDTO));
  }

  //workspace 삭제
  @DeleteMapping("/{workspaceId}")
  public ResponseEntity<String> remove(@PathVariable("workspaceId") Long workspaceId,
                                       @RequestHeader("Authorization") String token){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeader(userId, workspaceId);
    return ResponseEntity.ok(workspaceService.remove(workspaceId,userId));
  }

  //workspace 리스트에서 하나만조회
  @GetMapping("/{workspaceId}")
  public ResponseEntity<WorkSpaceResponseDTO> getOne(@PathVariable("workspaceId") Long workspaceId,
                                                     @RequestHeader("Authorization") String token){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkWSMember(userId,workspaceId);
    return ResponseEntity.ok(workspaceService.getOne(userId, workspaceId));
  }

  ///////////////////////////////////////////////
  ////////////////ws 멤버 관리컨트롤러///////////////////////

  //workspace 멤버조회(role)
  @GetMapping("/{workspaceId}/role")
  public ResponseEntity<WSMemberResponseDTO> getWorkSpaceRole(@RequestHeader("Authorization") String token,
                                                              @PathVariable("workspaceId") Long workspaceId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkWSMember(userId,workspaceId);
    return ResponseEntity.ok(wsMemberService.getWorkSpaceRole(userId,workspaceId));
  }

  //워크스페이스 참여 멤버 가져오기
  @GetMapping("/{workspaceId}/members")
  public ResponseEntity<List<MemberWithUserInfoDTO>> getWsMemberWithUserInfo(@PathVariable Long workspaceId,
                                                                             @RequestHeader("Authorization") String authorizationHeader){
    List<MemberWithUserInfoDTO> dtos = wsMemberService.getWsMemberWithUserInfo(workspaceId);
    return ResponseEntity.ok(dtos);
  }

  //친구목록(같은 워크스페이스참여상태 구분)
  @GetMapping("/{workspaceId}/friends")
  public ResponseEntity<List<FriendWithWorkspaceStatusDTO>> getFriendWithWorkspace(@RequestHeader("Authorization") String token,
                                                                                   @PathVariable("workspaceId") Long workspaceId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(wsMemberService.getFriendWithWorkspace(userId,workspaceId));
  }

  //멤버 초대하기(리더+서브리더 가능)
  @PostMapping("/{workspaceId}/invite/{friendId}")
  public ResponseEntity<String> inviteMember(@RequestHeader("Authorization") String token,
                                             @PathVariable("workspaceId") Long workspaceId,
                                             @PathVariable("friendId") Long friendId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeaderAndSubLeader(userId,workspaceId);
    return ResponseEntity.ok(wsMemberService.inviteMember(friendId,workspaceId));
  }

  //멤버 내보내기(리더만가능)
  @DeleteMapping("/{workspaceId}/removeMember/{memberId}")
  public ResponseEntity<String> removeMember(@RequestHeader("Authorization") String token,
                                             @PathVariable("workspaceId") Long workspaceId,
                                             @PathVariable("memberId") Long memberId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeader(userId,workspaceId);
    return ResponseEntity.ok(wsMemberService.removeMember(memberId,workspaceId));
  }
  //리더 위임하기(리더만가능)
  @PutMapping("/{workspaceId}/transferLeader/{memberId}")
  public ResponseEntity<String> transferLeader(@RequestHeader("Authorization") String token,
                                               @PathVariable("workspaceId") Long workspaceId,
                                               @PathVariable("memberId") Long memberId) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeader(userId, workspaceId);
    return ResponseEntity.ok(wsMemberService.transferLeader(userId,memberId,workspaceId));
  }
  //서브리더<->멤버 권한 양방향(리더만가능)
  @PutMapping("/{workspaceId}/transferRole/{memberId}")
  public ResponseEntity<String> transferRole(@RequestHeader("Authorization") String token,
                                             @PathVariable("workspaceId") Long workspaceId,
                                             @PathVariable("memberId") Long memberId,
                                             @RequestBody WSMemberRoleRequestDTO role){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeader(userId, workspaceId);
    return ResponseEntity.ok(wsMemberService.transferRole(workspaceId,memberId,role.getRole()));
  }
  //링크 초대방식
  @PostMapping("/{workspaceId}/linkInvite")
  public ResponseEntity<String> linkInviteMember(@RequestHeader("Authorization") String token,
                                                 @PathVariable("workspaceId") Long workspaceId,
                                                 @RequestBody Map<String, String> requestEmail){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeaderAndSubLeader(userId,workspaceId);

    return ResponseEntity.ok(wsMemberService.linkInviteMember(workspaceId,requestEmail.get("email")));
  }

  //////////////////////공통 유효성검사(리더확인)
  //워크스페이스등 수정삭제시 리더인지 확인체크
  private void checkLeader(Long userId, Long workSpaceId) {
    wsMemberService.checkLeader(userId, workSpaceId);
  }

  //리더,서브리더인지 확인체크(멤버먼 예외던짐)
  private void checkLeaderAndSubLeader(Long userId, Long workSpaceId) {
    wsMemberService.checkLeaderAndSubLeader(userId, workSpaceId);
  }

  //워크스페이스에 존재하는 멤버인지 확인
  private void checkWSMember(Long userId, Long workSpaceId){
    wsMemberService.checkWSMember(userId, workSpaceId);
  }
}
