package com.minglers.minglespace.todo.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
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
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
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
  private final UserRepository userRepository;
  private final ModelMapper modelMapper;

  @Override
  @Transactional(readOnly = true)
  public Slice<TodoResponseDTO> getTodoWithAssigneeInfo(Long workspaceId, String searchKeyword, Long userId, String sortType, String searchType, Pageable pageable) {
    WSMember wsMember = wsMemberRepository.findByUserIdAndWorkSpaceId(userId, workspaceId)
            .orElseThrow(() -> new RuntimeException("Workspace member not found"));

//    List<Todo> todoList = todoRepository.findTodosByAssigneeWsMemberId(wsMember.getId());

//    Slice<Todo> pageResult = null; // 초기화
    Sort sort;
    switch(sortType.toLowerCase()){
      case "content_asc":
        sort = Sort.by("content").ascending();
        log.info("내용순");
        break;
      case "start_date_asc":
        sort = Sort.by("startDate").ascending();
        log.info("시간오름차순");
        break;
      case "start_date_desc":
        sort = Sort.by("startDate").descending();
        log.info("시간내림차순");
        break;
      default:
        sort = Sort.by("title").ascending();
        log.info("제목순");
        break;
    }

    Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    Slice<Todo> pageResult;
    if (searchKeyword != null && !searchKeyword.isEmpty()) {
      switch (searchType.toLowerCase()) {
        case "title":
          pageResult = todoRepository.findByWorkspaceIdAndTitleOrContent(workspaceId, searchKeyword, sortType, sortedPageable);
          break;
        case "assignee":
          pageResult = todoRepository.findByWorkspaceIdAndAssigneeName(workspaceId, searchKeyword, sortedPageable);
          break;
        default:
          pageResult = todoRepository.findAllTodoByWorkSpaceId(workspaceId, sortedPageable);
          break;
      }
    } else {
      pageResult = todoRepository.findAllTodoByWorkSpaceId(workspaceId, sortedPageable);
    }

    // pageResult가 초기화되지 않은 경우를 방지하도록 수정
    if (pageResult == null || pageResult.getContent().isEmpty()) {
      // 기본적으로 빈 Slice를 리턴하거나 예외를 처리하도록 합니다.
      return new SliceImpl<>(Collections.emptyList(), sortedPageable, false);
    }

    List<TodoResponseDTO> resultTodoList = pageResult.getContent().stream().map(todo -> {
      String creatorname = todo.getWsMember() != null ? todo.getWsMember().getUser().getName() : "unknown";

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
              .start_date(todo.getStartDate())
              .end_date(todo.getEndDate())
              .complete(todo.isComplete())
              .creator_name(creatorname)
              .assignee_list(assigneeList)
              .build();
    }).collect(Collectors.toList());

    // Slice는 페이지네이션을 위해 TotalCount와 hasNextPage를 필요로 합니다.
    boolean hasNext = pageResult.hasNext();
    return new SliceImpl<>(resultTodoList, sortedPageable, hasNext);
  }


  @Override
  @Transactional(readOnly = true)
  public Slice<TodoResponseDTO> getAllTodo(Long workspaceId, String searchKeyword, String sortType, String searchType, Pageable pageable) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을 수 없습니다."));
    Sort sort;
    switch(sortType.toLowerCase()){
      case "content_asc":
        sort = Sort.by("content").ascending();
        break;
      case "start_date_asc":
        sort = Sort.by("startDate").ascending();
        break;
      case "start_date_desc":
        sort = Sort.by("startDate").descending();
        break;
      default:
        sort = Sort.by("title").ascending();
        break;
    }

    Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    Slice<Todo> pageResult;
    if (searchKeyword != null && !searchKeyword.isEmpty()) {
      switch (searchType.toLowerCase()) {
        case "title":
          pageResult = todoRepository.findByWorkspaceIdAndTitleOrContent(workspaceId, searchKeyword, sortType, sortedPageable);
          break;
        case "assignee":
          pageResult = todoRepository.findByWorkspaceIdAndAssigneeName(workspaceId, searchKeyword, sortedPageable);
          break;
        default:
          pageResult = todoRepository.findAllTodoByWorkSpaceId(workspaceId, sortedPageable);
          break;
      }
    } else {
      pageResult = todoRepository.findAllTodoByWorkSpaceId(workspaceId, sortedPageable);

    }
    List<TodoResponseDTO> todoResponseDTOList = pageResult.getContent().stream().map(todo -> {
      String creatorName = todo.getWsMember().getUser().getName();
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
              .start_date(todo.getStartDate())
              .end_date(todo.getEndDate())
              .complete(todo.isComplete())
              .creator_name(creatorName)
              .assignee_list(assigneeList)
              .build();
    }).collect(Collectors.toList());

    boolean hasNext = pageResult.hasNext();
    return new SliceImpl<>(todoResponseDTOList, pageable, hasNext);
  }


  @Override
  @Transactional
  public TodoResponseDTO postAddTodo(Long userId, Long workspaceId, TodoRequestDTO todoRequestDTO) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을 수 없습니다."));

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("유저 정보를 찾을 수 없습니다."));

    WSMember wsMember = user.getWsMembers().stream()
            .filter(wsMembers -> wsMembers.getUser().getId().equals(userId)
                    && wsMembers.getWorkSpace().getId().equals(workspaceId))
            .findFirst().orElseThrow(() -> new IllegalArgumentException("WSMember 정보를 찾을 수 없습니다."));

    Todo newTodo = Todo.builder()
            .title(todoRequestDTO.getTitle())
            .content(todoRequestDTO.getContent())
            .startDate(todoRequestDTO.getStart_date())
            .endDate(todoRequestDTO.getEnd_date())
            .wsMember(wsMember)
            .workSpace(workSpace).build();

    List<TodoAssignee> assignees = new ArrayList<>();
    for (Long wsMemberId : todoRequestDTO.getWsMember_id()) {
      WSMember assigneeWsMember = wsMemberRepository.findById(wsMemberId)
              .orElseThrow(() -> new IllegalArgumentException("Assignee 정보를 찾을 수 없습니다."));

      TodoAssignee todoAssignee = TodoAssignee.builder()
              .todo(newTodo)
              .wsMember(assigneeWsMember).build();

      assignees.add(todoAssignee);
    }
    newTodo.changeTodoAssigneeList(assignees);
    todoRepository.save(newTodo);

    List<WSMemberResponseDTO> assigneeList =
            newTodo.getTodoAssigneeList().stream()
                    .map(assignee -> new WSMemberResponseDTO(assignee.getWsMember().getId(),
                            assignee.getWsMember().getUser().getName(), assignee.getWsMember().getRole().toString()))
                    .collect(Collectors.toList());
    return TodoResponseDTO.builder()
            .id(newTodo.getId())
            .title(newTodo.getTitle())
            .content(newTodo.getContent())
            .start_date(newTodo.getStartDate())
            .end_date(newTodo.getEndDate())
            .creator_name(newTodo.getWsMember().getUser().getName())
            .assignee_list(assigneeList).build();
  }

  @Override
  @Transactional(readOnly = true)
  public TodoResponseDTO getOneTodo(Long todoId, Long workspaceId) {
    List<Todo> todoList = todoRepository.findAllTodoByWorkSpaceId(workspaceId);
//    Todo todo = todoRepository.findById(todoId).orElseThrow();
    Todo filterTodo = todoList.stream().filter(todo -> todo.getId().equals(todoId)).findFirst().orElseThrow(() ->
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
            .start_date(filterTodo.getStartDate())
            .end_date(filterTodo.getEndDate())
            .complete(filterTodo.isComplete())
            .creator_name(creatorname)
            .assignee_list(assigneeList)
            .build();
  }

  @Override
  @Transactional
  public TodoResponseDTO putTodoWithAssigneeInfo(Long todoId, TodoRequestDTO todoRequestDTO) {
    Todo todo = todoRepository.findById(todoId).orElseThrow(() ->
            new TodoException(HttpStatus.NOT_FOUND.value(), "해당하는 할일 정보를 찾을수 없습니다."));

    todo.changeTitle(todoRequestDTO.getTitle());
    todo.changeContent(todoRequestDTO.getContent());
    todo.changeStart_date(todoRequestDTO.getStart_date());
    todo.changeEnd_date(todoRequestDTO.getEnd_date());
    todo.changeComplete(todoRequestDTO.isComplete());

    todo.getTodoAssigneeList().clear();

    List<TodoAssignee> newTodoAssigneeList = todoRequestDTO.getWsMember_id().stream().map(assigneeId -> {
      WSMember wsMember = wsMemberRepository.findById(assigneeId).orElseThrow(() ->
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
            .start_date(todo.getStartDate())
            .end_date(todo.getEndDate())
            .complete(todo.isComplete())
            .creator_name(todo.getWsMember().getUser().getName())
            .assignee_list(assigneeList).build();
  }

  @Override
  @Transactional
  public String deleteTodo(Long todoId) {
    Todo todo = todoRepository.findById(todoId).orElseThrow(() ->
            new TodoException(HttpStatus.NOT_FOUND.value(), "해당하는 할일 정보를 찾을수 없습니다."));

    todoRepository.deleteById(todoId);


    return "Delete Success";
  }
}