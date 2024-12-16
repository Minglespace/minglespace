package com.minglers.minglespace.todo.service;

import com.minglers.minglespace.todo.dto.TodoRequestDTO;
import com.minglers.minglespace.todo.dto.TodoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import java.util.List;

public interface TodoService {
  Slice<TodoResponseDTO> getTodoWithAssigneeInfo(Long workspaceId, String searchKeyword, Long userId, String sortType, String searchType, Pageable pageable);
  Slice<TodoResponseDTO> getAllTodo(Long workspaceId, String searchKeyword, String sortType, String searchType, Pageable pageable);
  TodoResponseDTO postAddTodo(Long userId, Long workspaceId, TodoRequestDTO todoRequestDTO);
  TodoResponseDTO getOneTodo(Long todoId, Long workspaceId);
  TodoResponseDTO putTodoWithAssigneeInfo(Long todoId, TodoRequestDTO todoRequestDTO);
  String deleteTodo(Long todoId);
//  List<TodoResponseDTO> getAllTodoWithAssigneeInfo(Long workspaceId);
//  List<TodoResponseDTO> addTodo(Long workspaceId, TodoRequestDTO todoRequestDTO);
//  List<TodoResponseDTO> putTodo(Long todoId, TodoRequestDTO todoRequestDTO);
//  String deleteTodo(Long todoId);
  //  List<TodoResponseDTO> getTodo(Long workspaceId, Long wsMemberId);
}
