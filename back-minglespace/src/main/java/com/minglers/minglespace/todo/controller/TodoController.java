package com.minglers.minglespace.todo.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.todo.dto.TodoRequestDTO;
import com.minglers.minglespace.todo.dto.TodoResponseDTO;
import com.minglers.minglespace.todo.service.TodoService;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import com.minglers.minglespace.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/workspace/{workspaceId}/todo")
public class TodoController {

  private final TodoService todoService;
  private final WorkspaceService workspaceService;
  private final JWTUtils jwtUtils;

  @GetMapping({"/search", "/search/{searchKeyword}"}) //유저용 (본인이 작업해야 하는 것)
  public ResponseEntity<Slice<TodoResponseDTO>> getTodo(@RequestHeader("Authorization") String token,
                                                        @PathVariable(value = "searchKeyword", required = false) String searchKeyword,
                                                        @PathVariable("workspaceId") Long workspaceId,
                                                        @RequestParam(value = "sortType", defaultValue = "title") String sortType,
                                                        @RequestParam(value = "searchType") String searchType,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "16") int size){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(todoService.getTodoWithAssigneeInfo(workspaceId, searchKeyword, userId, sortType, searchType, pageable));
  }

  @GetMapping({"/leader", "/leader/{searchKeyword}"})
  public ResponseEntity<Slice<TodoResponseDTO>> getAllTodo(
          @RequestHeader("Authorization") String token,
          @PathVariable("workspaceId") Long workspaceId,
          @PathVariable(value = "searchKeyword", required = false) String searchKeyword,
          @RequestParam(value = "sortType", defaultValue = "title") String sortType,
          @RequestParam(value = "searchType") String searchType,
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "16") int size) {

    Long userId = jwtUtils.extractUserId(token.substring(7));
    Pageable pageable = PageRequest.of(page, size);

    return ResponseEntity.ok(todoService.getAllTodo(workspaceId, searchKeyword, sortType, searchType, pageable));
  }

  @GetMapping("/{todoId}")
  public ResponseEntity<TodoResponseDTO> getOneTodo(@RequestHeader("Authorization") String token,
  @PathVariable("todoId") Long todoId, @PathVariable("workspaceId") Long workspaceId) {
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(todoService.getOneTodo(todoId, workspaceId));
  }

  @PostMapping("")
  public ResponseEntity<TodoResponseDTO> addTodo(@RequestHeader("Authorization") String token,
                                                @PathVariable("workspaceId") Long workspaceId, @RequestBody TodoRequestDTO todoRequestDTO){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(todoService.postAddTodo(userId, workspaceId, todoRequestDTO));
  }

  @PutMapping("/{todoId}")
  public ResponseEntity<TodoResponseDTO> putTodo(@RequestHeader("Authorization") String token,
                                                 @PathVariable("todoId") Long todoId, @RequestBody TodoRequestDTO todoRequestDTO){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    log.info("qwerasdf"+todoRequestDTO.toString());
    return ResponseEntity.ok(todoService.putTodoWithAssigneeInfo(todoId, todoRequestDTO));
  }


  @DeleteMapping("/{todoId}")
  public ResponseEntity<String> deleteTodo(@RequestHeader("Authorization") String token,
                                           @PathVariable("todoId") Long todoId){
    Long userId = jwtUtils.extractUserId(token.substring(7));
    return ResponseEntity.ok(todoService.deleteTodo(todoId));
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
