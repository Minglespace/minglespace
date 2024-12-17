package com.minglers.minglespace.calendar.repository;

import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.calendar.entity.Calendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
  List<Calendar> findCalendarByWorkspaceId(Long workspaceId);

}
