package com.minglers.minglespace.calendar.service;


import com.minglers.minglespace.calendar.dto.CalendarRequestDTO;
import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;

import java.util.List;

public interface CalendarService {
  List<CalendarResponseDTO> getCalendarNotice(Long workspaceId);
  List<CalendarResponseDTO> getCalendarPrivate(Long workspaceId, Long wsMemberId);
  CalendarResponseDTO addCalendar(Long workspaceId, CalendarRequestDTO calendarRequestDTO, Long wsMemberId);
  CalendarResponseDTO modifyCalendar(Long workspaceId, Long calendarId, CalendarRequestDTO calendarRequestDTO);
  String deleteCalendar(Long workspaceId, Long calendarId);

}
