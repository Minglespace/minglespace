package com.minglers.minglespace.todo.controller;

import com.minglers.minglespace.todo.dto.TodoResponseDTO;
import com.minglers.minglespace.todo.service.TodoService;
import com.minglers.minglespace.workspace.entity.WSMember;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/workspace/{workspaceId}/todo")
public class TodoController {

  private final TodoService todoService;

  @GetMapping("/{wsMemberId}")
  public ResponseEntity<List<TodoResponseDTO>> getTodo(@PathVariable("workspaceId") Long workspaceId, @PathVariable("wsMemberId") Long wsMemberId){
    return ResponseEntity.ok(todoService.getTodoWithAssigneeInfo(workspaceId, wsMemberId));
  }
}
