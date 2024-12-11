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
import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
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

    WSMember wsMember = wsMemberRepository.findByUserIdAndWorkSpaceId(userId, workspaceId)
            .orElseThrow();
    List<Todo> todoList = todoRepository.findTodosByAssigneeWsMemberId(wsMember.getId());
    List<Todo> connectedTodoList = todoList.stream().map(todo -> {
      if (todo.getWsMember() == null) {
        todo.changeWsMember(wsMember);
      }
      return todo;
    }).collect(Collectors.toList());

    List<TodoResponseDTO> filterTodoList = connectedTodoList.stream()
            .filter(todo -> todo.getWorkSpace().getId().equals(workspaceId))
            .map(todo -> {
              log.info("todo_________________________");
              log.info(todo.toString());
              String creatorname = todo.getWsMember().getUser().getName();

              List<WSMemberResponseDTO> assigneeList = todo.getTodoAssigneeList().stream()
                      .map(assignee -> new WSMemberResponseDTO(
                              assignee.getWsMember().getId(),
                              assignee.getWsMember().getUser().getName(),
                              assignee.getWsMember().getRole().toString()))
                      .collect(Collectors.toList());
              log.info("assigneeList_________________________");
              log.info(assigneeList.toString());

              return TodoResponseDTO.builder()
                      .id(todo.getId())
                      .title(todo.getTitle())
                      .content(todo.getContent())
                      .start_date(todo.getStart_date())
                      .end_date(todo.getEnd_date())
                      .complete(todo.isComplete())
                      .creator_name(creatorname)
                      .assignee_list(assigneeList)
                      .build();
            }).collect(Collectors.toList());

    return filterTodoList;
  }

  @Override
  @Transactional(readOnly = true)
  public List<TodoResponseDTO> getAllTodo(Long workspaceId) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId).orElseThrow(()-> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을수 없습니다."));
    List<Todo> todoList = todoRepository.findAllTodoByWorkSpaceId(workspaceId);

    List<TodoResponseDTO> todoResponseDTOList = todoList.stream().map(todo -> {
      String creatorname = todo.getWsMember().getUser().getName();

      List<WSMemberResponseDTO> assigneeList = todo.getTodoAssigneeList().stream()
              .map(assignee -> new WSMemberResponseDTO(
                      assignee.getWsMember().getId(),
                      assignee.getWsMember().getUser().getName(),
                      assignee.getWsMember().getRole().toString()))
              .collect(Collectors.toList());

      return TodoResponseDTO.builder()
              .id(todo.getId())
              .title(todo.getTitle())
              .content(todo.getContent())
              .start_date(todo.getStart_date())
              .end_date(todo.getEnd_date())
              .complete(todo.isComplete())
              .creator_name(creatorname)
              .assignee_list(assigneeList)
              .build();
    }).collect(Collectors.toList());

    return todoResponseDTOList;
  }

  @Override
  @Transactional(readOnly = true)
  public TodoResponseDTO getOneTodo(Long todoId, Long workspaceId) {
    List<Todo> todoList = todoRepository.findAllTodoByWorkSpaceId(workspaceId);
//    Todo todo = todoRepository.findById(todoId).orElseThrow();
    Todo filterTodo = todoList.stream().filter(todo -> todo.getId().equals(todoId)).findFirst().orElseThrow(()->
            new TodoException(HttpStatus.NOT_FOUND.value(), "해당 할일 정보를 찾을수 없습니다."));
    String creatorname = filterTodo.getWsMember().getUser().getName();

    List<WSMemberResponseDTO> assigneeList = filterTodo.getTodoAssigneeList().stream()
            .map(assignee -> new WSMemberResponseDTO(
                    assignee.getWsMember().getId(),
                    assignee.getWsMember().getUser().getName(),
                    assignee.getWsMember().getRole().toString()))
            .collect(Collectors.toList());

    return TodoResponseDTO.builder()
            .id(filterTodo.getId())
            .title(filterTodo.getTitle())
            .content(filterTodo.getContent())
            .start_date(filterTodo.getStart_date())
            .end_date(filterTodo.getEnd_date())
            .complete(filterTodo.isComplete())
            .creator_name(creatorname)
            .assignee_list(assigneeList)
            .build();
  }

  @Override
  @Transactional
  public TodoResponseDTO putTodoWithAssigneeInfo(Long todoId, TodoRequestDTO todoRequestDTO) {
    Todo todo = todoRepository.findById(todoId).orElseThrow(()->
            new TodoException(HttpStatus.NOT_FOUND.value(), "해당하는 할일 정보를 찾을수 없습니다."));

    todo.changeTitle(todoRequestDTO.getTitle());
    todo.changeContent(todoRequestDTO.getContent());
    todo.changeStart_date(todoRequestDTO.getStart_date());
    todo.changeEnd_date(todoRequestDTO.getEnd_date());
    todo.changeComplete(todoRequestDTO.isComplete());

    todo.getTodoAssigneeList().clear();

    List<TodoAssignee> newTodoAssigneeList = todoRequestDTO.getAssignee_id().stream().map(assigneeId -> {
      WSMember wsMember = wsMemberRepository.findById(assigneeId).orElseThrow(()->
              new TodoException(HttpStatus.NOT_FOUND.value(), "담당자 정보를 찾을수 없습니다."));
      TodoAssignee todoAssignee = new TodoAssignee();
      todoAssignee.changeWsMember(wsMember);
      todoAssignee.changeTodo(todo);
      return todoAssignee;
    }).collect(Collectors.toList());

    todo.changeTodoAssigneeList(newTodoAssigneeList);
    todoRepository.save(todo);

    List<WSMemberResponseDTO> assigneeList = todo.getTodoAssigneeList().stream()
            .map(assignee -> new WSMemberResponseDTO(
                    assignee.getWsMember().getId(),
                    assignee.getWsMember().getUser().getName(),
                    assignee.getWsMember().getRole().toString()))
            .collect(Collectors.toList());

    return TodoResponseDTO.builder()
            .id(todo.getId())
            .title(todo.getTitle())
            .content(todo.getContent())
            .start_date(todo.getStart_date())
            .end_date(todo.getEnd_date())
            .complete(todo.isComplete())
            .creator_name(todo.getWsMember().getUser().getName())
            .assignee_list(assigneeList).build();
  }

  @Override
  @Transactional
  public String deleteTodo(Long todoId) {
    Todo todo = todoRepository.findById(todoId).orElseThrow(()->
            new TodoException(HttpStatus.NOT_FOUND.value(), "해당하는 할일 정보를 찾을수 없습니다."));

    todoRepository.deleteById(todoId);


    return "Delete Success";
  }
}