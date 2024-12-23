package com.minglers.minglespace.calendar.repository;

import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.calendar.entity.Calendar;
import com.minglers.minglespace.calendar.type.CalendarType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
  List<Calendar> findCalendarByWorkspaceIdAndType(Long workspaceId, CalendarType calendarType);
  List<Calendar> findCalendarByWorkspaceIdAndWsMemberId(Long workspaceId, Long wsMemberId);

  @Query("SELECT c FROM Calendar c WHERE c.workspace.id = :workspaceId AND (c.wsMember IS NULL OR c.wsMember.id = :wsMemberId)")
  List<Calendar> findAllByWorkspaceIdAndWsMemberId(@Param("workspaceId") Long workspaceId,
                                                   @Param("wsMemberId") Long wsMemberId );



}
