package com.minglers.minglespace.todo.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.todo.dto.TodoAssigneeResponseDTO;
import com.minglers.minglespace.todo.dto.TodoResponseDTO;
import com.minglers.minglespace.todo.entity.Todo;
import com.minglers.minglespace.todo.exception.TodoException;
import com.minglers.minglespace.todo.repository.TodoAssigneeRepository;
import com.minglers.minglespace.todo.repository.TodoRepository;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TodoServiceImpl implements TodoService {
  private final TodoRepository todoRepository;
  private final TodoAssigneeRepository todoAssigneeRepository;
  private final WorkspaceRepository workspaceRepository;
  private final WSMemberRepository wsMemberRepository;
  private final ModelMapper modelMapper;

  @Override
  @Transactional(readOnly = true)
  public List<TodoResponseDTO> getTodoWithAssigneeInfo(Long workspaceId, Long wsMemberId) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new TodoException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을 수 없습니다."));

    List<Todo> todoList = workSpace.getTodolist();

    List<TodoResponseDTO> filteredTodoList = todoList.stream()
            .filter(todo -> todo.getTodoAssigneeList().stream()
                    .anyMatch(todoAssignee -> todoAssignee.getWsMember().getId().equals(wsMemberId))) // 현재 멤버가 할당된 Todo만 필터링
            .map(todo -> {
              TodoResponseDTO todoResponseDTO = TodoResponseDTO.builder()
                      .id(todo.getId())
                      .title(todo.getTitle())
                      .content(todo.getContent())
                      .start_date(todo.getStart_date())
                      .end_date((todo.getEnd_date()))
                      .build();

              List<TodoAssigneeResponseDTO> todoAssigneeResponseDTOS = todo.getTodoAssigneeList().stream()
                      .filter(todoAssignee -> todoAssignee.getWsMember().getId().equals(wsMemberId))
                      .map(todoAssignee -> {
                        return TodoAssigneeResponseDTO.builder()
                                .id(todoAssignee.getId())
                                .todoId(todoAssignee.getTodo().getId())
                                .wsmember_id(todoAssignee.getWsMember().getId())
                                .build();
                      })
                      .collect(Collectors.toList());
              todoResponseDTO.setTodoAssigneeResponseDTOList(todoAssigneeResponseDTOS);
              return todoResponseDTO;
            })
            .collect(Collectors.toList());
    return filteredTodoList;
  }


}