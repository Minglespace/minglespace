package com.minglers.minglespace.calendar.service;

import com.minglers.minglespace.calendar.dto.CalendarRequestDTO;
import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.calendar.entity.Calendar;
import com.minglers.minglespace.calendar.repository.CalendarRepository;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.mapper.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarServiceImpl implements CalendarService{
  private final CalendarRepository calendarRepository;
  private final WorkspaceRepository workspaceRepository;
  private final ModelMapper modelMapper;

  @Override
  public List<CalendarResponseDTO> getCalendar(Long workspaceId) {
    WorkSpace workspace = workspaceRepository.findById(workspaceId).orElseThrow();

    List<Calendar> calendarList = calendarRepository.findCalendarByWorkspaceId(workspaceId);
    return calendarList.stream().map(calendar ->
      modelMapper.map(calendar, CalendarResponseDTO.class)).toList();
  }

  @Override
  public CalendarResponseDTO getOneCalendar(Long workspaceId, Long calendarId) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId).orElseThrow();

    Calendar calendar = calendarRepository.findById(calendarId).orElseThrow();
    
    return modelMapper.map(calendar, CalendarResponseDTO.class);
  }

  @Override
  public CalendarResponseDTO addCalendar(Long workspaceId, CalendarRequestDTO calendarRequestDTO) {
    WorkSpace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
    Calendar calendar = modelMapper.map(calendarRequestDTO, Calendar.class);
    calendar.changeWorkspace(workspace);
    calendarRepository.save(calendar);
    CalendarResponseDTO calendarResponseDTO = modelMapper.map(calendar,CalendarResponseDTO.class);

    return calendarResponseDTO;
  }

  @Override
  public CalendarResponseDTO modifyCalendar(Long workspaceId, Long calendarId, CalendarRequestDTO calendarRequestDTO) {
    WorkSpace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
    Calendar calendar = calendarRepository.findById(calendarId).orElseThrow();

    calendar.changeTitle(calendarRequestDTO.getTitle());
    calendar.changeDescription(calendarRequestDTO.getDescription());
    calendar.changeStart(calendarRequestDTO.getStart());

    calendarRepository.save(calendar);
    CalendarResponseDTO calendarResponseDTO = modelMapper.map(calendar, CalendarResponseDTO.class);
    return calendarResponseDTO;
  }

  @Override
  public String deleteCalendar(Long workspaceId, Long calendarId) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId).orElseThrow();
    Calendar calendar = calendarRepository.findById(calendarId).orElseThrow();

    calendarRepository.delete(calendar);
    return "Calendar Event Delete Success";
  }
}
