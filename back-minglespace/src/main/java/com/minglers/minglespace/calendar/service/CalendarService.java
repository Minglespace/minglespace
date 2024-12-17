package com.minglers.minglespace.calendar.service;


import com.minglers.minglespace.calendar.dto.CalendarRequestDTO;
import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;

import java.util.List;

public interface CalendarService {
  List<CalendarResponseDTO> getCalendar(Long workspaceId);
  CalendarResponseDTO getOneCalendar(Long workspaceId, Long calendarId);
  CalendarResponseDTO addCalendar(Long workspaceId, CalendarRequestDTO calendarRequestDTO);
  CalendarResponseDTO modifyCalendar(Long workspaceId, Long calendarId, CalendarRequestDTO calendarRequestDTO);
  String deleteCalendar(Long workspaceId, Long calendarId);

}
