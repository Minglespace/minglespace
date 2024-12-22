package com.minglers.minglespace.calendar.repository;

import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.calendar.entity.Calendar;
import com.minglers.minglespace.calendar.type.CalendarType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
  List<Calendar> findCalendarByWorkspaceIdAndType(Long workspaceId, CalendarType calendarType);
  List<Calendar> findCalendarByWorkspaceIdAndWsMemberId(Long workspaceId, Long wsMemberId);
  List<Calendar> findCalendarByWorkspaceId(Long workspaceId);
}