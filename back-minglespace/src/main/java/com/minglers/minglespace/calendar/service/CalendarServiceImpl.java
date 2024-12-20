package com.minglers.minglespace.calendar.service;

import com.minglers.minglespace.calendar.dto.CalendarRequestDTO;
import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.calendar.entity.Calendar;
import com.minglers.minglespace.calendar.exception.CalendarException;
import com.minglers.minglespace.calendar.repository.CalendarRepository;
import com.minglers.minglespace.calendar.type.CalendarType;
import com.minglers.minglespace.todo.entity.Todo;
import com.minglers.minglespace.todo.repository.TodoAssigneeRepository;
import com.minglers.minglespace.todo.repository.TodoRepository;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.exception.WorkspaceException;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.mapper.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarServiceImpl implements CalendarService{
  private final CalendarRepository calendarRepository;
  private final WorkspaceRepository workspaceRepository;
  private final WSMemberRepository wsMemberRepository;
  private final TodoAssigneeRepository todoAssigneeRepository;
  private final ModelMapper modelMapper;

  private WorkSpace findByWorkspaceId(Long workspaceId){
    return workspaceRepository.findById(workspaceId).orElseThrow(
            ()-> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을수 없습니다.")
    );
  }

  private Calendar findByCalendarId(Long calendarId){
    return calendarRepository.findById(calendarId).orElseThrow(
            ()->new CalendarException(HttpStatus.NOT_FOUND.value(), "캘린더 조회에 실패했습니다.")
    );
  }

  private WSMember findByWsMemberId(Long userId, Long workspaceId){
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId, workspaceId).orElseThrow(
            ()->new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스 멤버 조회에 실패했습니다."));
  }

  @Override
  public List<CalendarResponseDTO> getCalendarAll(Long workspaceId, Long wsMemberId) {
    WorkSpace workspace = findByWorkspaceId(workspaceId);
    WSMember wsMember = findByWsMemberId(wsMemberId, workspaceId);

    List<Calendar> calendarList = calendarRepository.findCalendarByWorkspaceId(workspaceId);

    List<CalendarResponseDTO> calendarResponseDTO = calendarList.stream().map(calendar ->
            modelMapper.map(calendar, CalendarResponseDTO.class)).collect(Collectors.toList());

    List<Todo> todoList = todoAssigneeRepository.findAllTodoByWorkspaceIdAndWsMemberId(workspaceId,wsMember.getId());
    todoList.forEach((todo -> {CalendarResponseDTO calendarDTO = CalendarResponseDTO.builder()

            .title(todo.getTitle())
            .description(todo.getContent())
            .start(todo.getStartDate())
            .end(todo.getEndDate())
            .type("TODO")
            .build();

      calendarResponseDTO.add(calendarDTO);
    }));
    return calendarResponseDTO;
  }

  @Override
  public List<CalendarResponseDTO> getCalendarNotice(Long workspaceId) {
    WorkSpace workspace = findByWorkspaceId(workspaceId);
    List<Calendar> calendarList = calendarRepository.findCalendarByWorkspaceIdAndType(workspaceId, CalendarType.NOTICE);

    return calendarList.stream().map(calendar ->
      modelMapper.map(calendar, CalendarResponseDTO.class)).toList();
  }

  @Override
  public List<CalendarResponseDTO> getCalendarPrivate(Long workspaceId, Long wsMemberId) {
    WorkSpace workspace = findByWorkspaceId(workspaceId);
    WSMember wsMember = findByWsMemberId(wsMemberId, workspaceId);
    List<Calendar> calendarList = calendarRepository.findCalendarByWorkspaceIdAndWsMemberId(workspaceId, wsMember.getId());

    List<CalendarResponseDTO> calendarResponseDTO = calendarList.stream().map(calendar ->
            modelMapper.map(calendar, CalendarResponseDTO.class)).collect(Collectors.toList());

    List<Todo> todoList = todoAssigneeRepository.findAllTodoByWorkspaceIdAndWsMemberId(workspaceId,wsMember.getId());
    todoList.forEach((todo -> {
      CalendarResponseDTO calendarDTO = CalendarResponseDTO.builder()

              .title(todo.getTitle())
              .description(todo.getContent())
              .start(todo.getStartDate())
              .end(todo.getEndDate())
              .type("TODO")
              .build();

      calendarResponseDTO.add(calendarDTO);
    }));
    return calendarResponseDTO;
  }

  @Override
  @Transactional
  public CalendarResponseDTO addCalendar(Long workspaceId, CalendarRequestDTO calendarRequestDTO, Long wsMemberId) {
    WorkSpace workspace = findByWorkspaceId(workspaceId);
    WSMember wsMember = findByWsMemberId(wsMemberId, workspaceId);
    Calendar calendar = modelMapper.map(calendarRequestDTO, Calendar.class);
    calendar.changeWorkspace(workspace);

    if(CalendarType.PRIVATE.name().equals(calendarRequestDTO.getType())) {
      calendar.changeWsMember(wsMember);
    }

    Calendar savedCalendar = calendarRepository.save(calendar);
    return modelMapper.map(savedCalendar,CalendarResponseDTO.class);
  }

  @Override
  @Transactional
  public CalendarResponseDTO modifyCalendar(Long workspaceId, Long calendarId, CalendarRequestDTO calendarRequestDTO) {
    WorkSpace workspace = findByWorkspaceId(workspaceId);
    Calendar calendar = findByCalendarId(calendarId);

    calendar.changeTitle(calendarRequestDTO.getTitle());
    calendar.changeDescription(calendarRequestDTO.getDescription());
    calendar.changeStart(calendarRequestDTO.getStart());
    calendar.changeEnd(calendarRequestDTO.getEnd());

    Calendar savedCalendar = calendarRepository.save(calendar);
    return modelMapper.map(savedCalendar, CalendarResponseDTO.class);
  }

  @Override
  @Transactional
  public String deleteCalendar(Long workspaceId, Long calendarId) {
    WorkSpace workSpace = findByWorkspaceId(workspaceId);
    Calendar calendar = findByCalendarId(calendarId);

    calendarRepository.delete(calendar);
    return "Calendar Event Delete Success";
  }
}
