package com.minglers.minglespace.workspace.controller;

import com.minglers.minglespace.workspace.dto.WorkspaceDTO;
import com.minglers.minglespace.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/workspace")
public class WorkspaceController {
//할일 1. user/userid는 나중에 jwt로 받아서 처리(지금은 url로)
     //2. 예외 처리
     //3. 삭제시 leader만 삭제가능 하게 하기.
     //4. 권한 부여시점은 하나 클릭했을떄 권한 조회후 jwt에 넣기.
  private final WorkspaceService workspaceService;

  //사이드바에서 workspace 클릭시 보여주는 리스트
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<WorkspaceDTO.Response>> list(@PathVariable("userId") Long userid){
    return ResponseEntity.ok(workspaceService.getList(userid));
  }

  //workspace 추가
  @PostMapping("/user/{userId}")
  public ResponseEntity<WorkspaceDTO.Response> register(@PathVariable("userId") Long userId,
                                  @RequestBody WorkspaceDTO.Request workSpaceDTO){
    return ResponseEntity.ok(workspaceService.resister(userId,workSpaceDTO));
  }

  //workspace 수정
  @PutMapping("/{workspaceId}")
  public ResponseEntity<WorkspaceDTO.Response> modify(@PathVariable("workspaceId") Long workspaceId,
                                   @RequestBody WorkspaceDTO.Request workSpaceDTO){
    return ResponseEntity.ok(workspaceService.modify(workspaceId,workSpaceDTO));
  }

  //workspace 삭제
  @DeleteMapping("/{workspaceId}/user/{userId}")
  public ResponseEntity<String> remove(@PathVariable("workspaceId") Long workspaceId,
                                   @PathVariable("userId") Long userId){
    return ResponseEntity.ok(workspaceService.remove(workspaceId,userId));
  }

  //workspace리스트에서 하나만조회
  @GetMapping("/{workspaceId}")
  public ResponseEntity<WorkspaceDTO.Response> getOne(@PathVariable("workspaceId") Long workspaceId){
    return ResponseEntity.ok(workspaceService.getOne(workspaceId));
  }

}
