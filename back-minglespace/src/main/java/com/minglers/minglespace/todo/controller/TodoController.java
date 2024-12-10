package com.minglers.minglespace.todo.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.todo.dto.TodoRequestDTO;
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

  private final JWTUtils jwtUtils;

  @GetMapping("") //유저용 (자신이 만든것 + 자신에게 부여된것)
  public ResponseEntity<List<TodoResponseDTO>> getTodo(@RequestHeader("Authorization") String token,
          @PathVariable("workspaceId") Long workspaceId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(todoService.getTodoWithAssigneeInfo(workspaceId, userId));
  }

//  @GetMapping("/leader")  //관리자용 모든 TODO보기
//  public ResponseEntity<List<TodoResponseDTO>> getAllTodo(@PathVariable("workspaceId") Long workspaceId){
//    return ResponseEntity.ok(todoService.getAllTodoWithAssigneeInfo(workspaceId));
//  }
//
//  @PostMapping("")
//  public ResponseEntity<List<TodoResponseDTO>> addTodo(@PathVariable("workspaceId") Long workspaceId, @RequestBody TodoRequestDTO todoRequestDTO)
//  {
//    return ResponseEntity.ok(todoService.addTodo(workspaceId, todoRequestDTO));
//  }
//
//  @PutMapping("/{todoId}")
//  public ResponseEntity<List<TodoResponseDTO>> putTodo(@PathVariable("todoId") Long todoId, @RequestBody TodoRequestDTO todoRequestDTO){
//    return ResponseEntity.ok(todoService.putTodo(todoId, todoRequestDTO));
//  }
//
//  @DeleteMapping("/{todoId}")
//  public ResponseEntity<String> deleteTodo(@PathVariable("todoId") Long todoId){
//    return ResponseEntity.ok(todoService.deleteTodo(todoId));
//  }
}
