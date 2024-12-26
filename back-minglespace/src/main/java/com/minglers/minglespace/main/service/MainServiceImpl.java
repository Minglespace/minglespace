package com.minglers.minglespace.main.service;

import com.minglers.minglespace.calendar.entity.Calendar;
import com.minglers.minglespace.calendar.repository.CalendarRepository;
import com.minglers.minglespace.main.dto.MainDeadlineNoticeDTO;
import com.minglers.minglespace.main.dto.MainDeadlineTodoDTO;
import com.minglers.minglespace.main.dto.MainNewNoticeDTO;
import com.minglers.minglespace.todo.entity.Todo;
import com.minglers.minglespace.todo.repository.TodoRepository;
import com.minglers.minglespace.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
@Slf4j
public class MainServiceImpl implements MainService{
  private final CalendarRepository calendarRepository;
  private final TodoRepository todoRepository;
  private final WorkspaceService workspaceService;

  @Override
  public Map<String, Object> getMainContent(Long userId) {
    Pageable pageable = PageRequest.of(0, 5);

    return Map.of("mainNewNotice",getNewNotice(userId, pageable),
            "mainDeadlineNotice", getDeadlineNotice(userId, pageable),
            "mainDeadlineTodo", getDeadlineTodo(userId, pageable),
            "workspaceAndMilestone", workspaceService.getList(userId));
  }

  private List<MainNewNoticeDTO> getNewNotice(Long userId, Pageable pageable){
    List<Calendar> calendarList = calendarRepository.findTop5ByUserIdAndNoticeType(userId, pageable);

    return calendarList.stream().map(newNotice -> {
      return MainNewNoticeDTO.builder()
              .title(newNotice.getTitle())
              .description(newNotice.getDescription())
              .start(newNotice.getStart())
              .end(newNotice.getEnd())
              .workspaceName(newNotice.getWorkspace().getName())
              .path("/workspace/"+newNotice.getWorkspace().getId()+"/calendar")
              .build();
    }).toList();
  }

  private List<MainDeadlineNoticeDTO> getDeadlineNotice(Long userId, Pageable pageable){
    List<Calendar> calendarList = calendarRepository.findCalendarsByUserIdAndNoticeTypeWithEndTimeWithin3Days(userId, LocalDateTime.now(), LocalDateTime.now().plusDays(3L), pageable);

    return calendarList.stream().map(deadlineNotice -> {
      return MainDeadlineNoticeDTO.builder()
              .title(deadlineNotice.getTitle())
              .description(deadlineNotice.getDescription())
              .start(deadlineNotice.getStart())
              .end(deadlineNotice.getEnd())
              .workspaceName(deadlineNotice.getWorkspace().getName())
              .path("/workspace/"+deadlineNotice.getWorkspace().getId()+"/calendar")
              .build();
    }).toList();
  }

  private List<MainDeadlineTodoDTO> getDeadlineTodo(Long userId, Pageable pageable){
    List<Todo> todoList = todoRepository.findTodosByUserIdAndAssigneeId(userId, LocalDateTime.now(), LocalDateTime.now().plusDays(3L), pageable);

    return todoList.stream().map(deadlineTodo -> {
      return MainDeadlineTodoDTO.builder()
              .title(deadlineTodo.getTitle())
              .description(deadlineTodo.getContent())
              .start(deadlineTodo.getStartDate())
              .end(deadlineTodo.getEndDate())
              .workspaceName(deadlineTodo.getWorkSpace().getName())
              .path("/workspace/"+deadlineTodo.getWorkSpace().getId()+"/todo")
              .build();
    }).toList();
  }
}
