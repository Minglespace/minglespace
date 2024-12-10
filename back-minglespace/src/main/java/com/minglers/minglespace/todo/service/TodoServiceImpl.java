package com.minglers.minglespace.todo.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.todo.dto.TodoAssigneeResponseDTO;
import com.minglers.minglespace.todo.dto.TodoRequestDTO;
import com.minglers.minglespace.todo.dto.TodoResponseDTO;
import com.minglers.minglespace.todo.entity.Todo;
import com.minglers.minglespace.todo.entity.TodoAssignee;
import com.minglers.minglespace.todo.exception.TodoException;
import com.minglers.minglespace.todo.repository.TodoAssigneeRepository;
import com.minglers.minglespace.todo.repository.TodoRepository;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.exception.WorkspaceException;
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
  public List<TodoResponseDTO> getTodoWithAssigneeInfo(Long workspaceId, Long userId) {

    List<Todo> todoList = todoRepository.findTodosByAssigneeWsMemberId(userId);
    todoList.forEach((todo)->log.info("todo임 : ", todo.toString()));


//    todoList.stream().filter(todo -> )
//    List<TodoResponseDTO> filteredTodoList = todoList.stream()
//            .filter(todo -> todo.getWsMember().getId().equals(wsMemberId) ||
//                    todo.getTodoAssigneeList().stream()
//                            .anyMatch(todoAssignee -> todoAssignee.getWsMember().getId().equals(wsMemberId))) // 현재 멤버가 할당된 Todo만 필터링
//            .map(todo -> {
//              TodoResponseDTO todoResponseDTO = TodoResponseDTO.builder()
//                      .id(todo.getId())
//                      .title(todo.getTitle())
//                      .content(todo.getContent())
//                      .start_date(todo.getStart_date())
//                      .end_date(todo.getEnd_date())
//                      .creator_id(todo.getWsMember().getId())
//                      .build();
//
//              List<TodoAssigneeResponseDTO> todoAssigneeResponseDTOS = todo.getTodoAssigneeList().stream()
//                      .filter(todoAssignee -> todoAssignee.getWsMember().getId().equals(wsMemberId))
//                      .map(todoAssignee -> {
//                        return TodoAssigneeResponseDTO.builder()
//                                .id(todoAssignee.getId())
//                                .todo_id(todoAssignee.getTodo().getId())
//                                .wsmember_id(todoAssignee.getWsMember().getId())
//                                .build();
//                      })
//                      .collect(Collectors.toList());
//              todoResponseDTO.setTodoAssigneeResponseDTOList(todoAssigneeResponseDTOS);
//              return todoResponseDTO;
//            })
//            .collect(Collectors.toList());
    return List.of();
  }

//  @Override
//  @Transactional(readOnly = true)
//  public List<TodoResponseDTO> getAllTodoWithAssigneeInfo(Long workspaceId) {
//    WorkSpace workSpace = workspaceRepository.findById(workspaceId)
//            .orElseThrow(() -> new TodoException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을 수 없습니다."));
//
//    List<Todo> todoList = workSpace.getTodolist();
//
//    List<TodoResponseDTO> allTodoList = todoList.stream()
//            .map(todo -> {
//              TodoResponseDTO todoResponseDTO = TodoResponseDTO.builder()
//                      .id(todo.getId())
//                      .title(todo.getTitle())
//                      .content(todo.getContent())
//                      .start_date(todo.getStart_date())
//                      .end_date(todo.getEnd_date())
//                      .creator_id(todo.getWsMember().getId())
//                      .build();
//
//              List<TodoAssigneeResponseDTO> todoAssigneeResponseDTOS = todo.getTodoAssigneeList().stream()
//                      .map(todoAssignee -> {
//                        return TodoAssigneeResponseDTO.builder()
//                                .id(todoAssignee.getId())
//                                .todo_id(todoAssignee.getTodo().getId())
//                                .wsmember_id(todoAssignee.getWsMember().getId())
//                                .build();
//                      })
//                      .collect(Collectors.toList());
//              todoResponseDTO.setTodoAssigneeResponseDTOList(todoAssigneeResponseDTOS);
//              return todoResponseDTO;
//            })
//            .collect(Collectors.toList());
//    return allTodoList;
//  }
//
//  @Override
//  @Transactional
//  public List<TodoResponseDTO> addTodo(Long workspaceId, TodoRequestDTO todoRequestDTO) {
//    WorkSpace workSpace = workspaceRepository.findById(workspaceId).orElseThrow(() -> new TodoException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을 수 없습니다."));
//
//    WSMember creator = wsMemberRepository.findById(todoRequestDTO.getCreator_id()).orElseThrow(() -> new TodoException(HttpStatus.NOT_FOUND.value(), "크리에이터를 찾을 수 없습니다."));
//    Todo todo = Todo.builder()
//            .title(todoRequestDTO.getTitle())
//            .content(todoRequestDTO.getContent())
//            .start_date(todoRequestDTO.getStart_date())
//            .end_date(todoRequestDTO.getEnd_date())
//            .workSpace(workSpace)
//            .wsMember(creator)
//            .build();
//
//    List<WSMember> assignees = wsMemberRepository.findAllById(todoRequestDTO.getAssignee_id());
//    List<TodoAssignee> todoAssigneeList = assignees.stream().map(assignee -> TodoAssignee.builder()
//            .todo(todo)
//            .wsMember(assignee).build()).collect(Collectors.toList());
//
//    log.info(todo.toString());
//    todo.changeWorkSpace(workSpace);
//    todo.changeWsMember(creator);
//
//    todo.addTodoAssigneeList(todoAssigneeList);
//    todoRepository.save(todo);
//
//    TodoResponseDTO todoResponseDTO = TodoResponseDTO.builder()
//            .id(todo.getId())
//            .title(todo.getTitle())
//            .start_date(todo.getStart_date())
//            .end_date(todo.getEnd_date())
//            .content(todo.getContent())
//            .creator_id(todo.getWsMember().getId())
//            .todoAssigneeResponseDTOList(todo.getTodoAssigneeList().stream().map(todoAssignee
//                    -> TodoAssigneeResponseDTO.builder()
//                    .id(todoAssignee.getId())
//                    .todo_id(todo.getId())
//                    .wsmember_id(todoAssignee.getWsMember().getId())
//                    .build())
//                    .collect(Collectors.toList()))
//            .build();
//
//    return List.of(todoResponseDTO);
//  }
//
//  @Override
//  public List<TodoResponseDTO> putTodo(Long todoId, TodoRequestDTO todoRequestDTO) {
//    Todo todo = todoRepository.findById(todoId).orElseThrow(() -> new TodoException(HttpStatus.NOT_FOUND.value(), "해당하는 할일을 찾을 수 없습니다."));
//
//    List<WSMember> assignees = wsMemberRepository.findAllById(todoRequestDTO.getAssignee_id());
//    List<TodoAssignee> todoAssigneeList = assignees.stream().map(assignee -> TodoAssignee.builder()
//            .todo(todo)
//            .wsMember(assignee).build()).collect(Collectors.toList());
//
//
//    todo.changeTitle(todoRequestDTO.getTitle());
//    todo.changeContent(todoRequestDTO.getContent());
//    todo.changeStart_date(todoRequestDTO.getStart_date());
//    todo.changeEnd_date(todoRequestDTO.getEnd_date());
//    todo.changeComplete(todoRequestDTO.isComplete());
//    todo.changeTodoAssigneeList(todoAssigneeList);
//    todoRepository.save(todo);
//
//    TodoResponseDTO todoResponseDTO = TodoResponseDTO.builder()
//            .title(todo.getTitle())
//            .content(todo.getContent())
//            .start_date(todo.getStart_date())
//            .end_date(todo.getEnd_date())
//            .complete(todo.isComplete())
//            .creator_id(todo.getWsMember().getId())
//            .todoAssigneeResponseDTOList(todo.getTodoAssigneeList().stream().map(todoAssignee -> TodoAssigneeResponseDTO.builder()
//                            .id(todoAssignee.getId())
//                            .todo_id(todo.getId())
//                            .wsmember_id(todoAssignee.getWsMember().getId())
//                            .build())
//                    .collect(Collectors.toList()))
//            .build();
//
//    return List.of(todoResponseDTO);
//  }
//
//  @Override
//  public String deleteTodo(Long todoId) {
//    Todo todo = todoRepository.findById(todoId).orElseThrow(() -> new TodoException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을 수 없습니다."));
//    todoRepository.deleteById(todoId);
//    return "TODO DELETE SUCCESS";
//  }
}