package com.minglers.minglespace.workspace.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
import com.minglers.minglespace.workspace.dto.WorkSpaceResponseDTO;
import com.minglers.minglespace.workspace.dto.WorkspaceRequestDTO;
import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
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

  //workspace 멤버조회(role)
  @GetMapping("/{workspaceId}/role")
  public ResponseEntity<WSMemberResponseDTO> getWorkSpaceRole(@RequestHeader("Authorization") String token,
                                                              @PathVariable("workspaceId") Long workspaceId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(workspaceService.getWorkSpaceRole(userId,workspaceId));
  }

  //수정삭제시 리더인지 확인체크
  public void checkLeader(Long userId, Long workSpaceId) {
    workspaceService.checkLeader(userId, workSpaceId);
  }

  //워크스페이스 참여 멤버 가져오기
  @GetMapping("/{workspaceId}/members")
  public ResponseEntity<List<MemberWithUserInfoDTO>> getWsMemberWithUserInfo(@PathVariable Long workspaceId,
                                                                             @RequestHeader("Authorization") String authorizationHeader){
    List<MemberWithUserInfoDTO> dtos = workspaceService.getWsMemberWithUserInfo(workspaceId);
    return ResponseEntity.ok(dtos);
  }

}
