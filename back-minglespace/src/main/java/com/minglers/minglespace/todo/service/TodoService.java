package com.minglers.minglespace.todo.service;

import com.minglers.minglespace.todo.dto.TodoResponseDTO;

import java.util.List;

public interface TodoService {
  List<TodoResponseDTO> getTodoWithAssigneeInfo(Long workspaceId, Long wsMemberId);
//  List<TodoResponseDTO> getTodo(Long workspaceId, Long wsMemberId);
}
