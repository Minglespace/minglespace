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
  public ResponseEntity<WorkSpaceResponseDTO> getOne(@PathVariable("workspaceId") Long workspaceId){
    return ResponseEntity.ok(workspaceService.getOne(workspaceId));
  }

  ///////////////////////////////////////////////
  ////////////////ws 멤버 관리컨트롤러///////////////////////

  //workspace 멤버조회(role)
  @GetMapping("/{workspaceId}/role")
  public ResponseEntity<WSMemberResponseDTO> getWorkSpaceRole(@RequestHeader("Authorization") String token,
                                                              @PathVariable("workspaceId") Long workspaceId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
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
    System.out.println("롤"+role.getRole());
    Long userId = jwtUtils.extractUserId(token.substring(7));
    checkLeader(userId, workspaceId);
    return ResponseEntity.ok(wsMemberService.transferRole(workspaceId,memberId,role.getRole()));
  }


  //////////////////////공통 유효성검사(리더확인)
  //워크스페이스등 수정삭제시 리더인지 확인체크
  public void checkLeader(Long userId, Long workSpaceId) {
    wsMemberService.checkLeader(userId, workSpaceId);
  }

  //리더,서브리더인지 확인체크(멤버먼 예외던짐)
  public void checkLeaderAndSubLeader(Long userId, Long workSpaceId) {
    wsMemberService.checkLeaderAndSubLeader(userId, workSpaceId);
  }
}
