package com.minglers.minglespace.calendar.repository;

import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.calendar.entity.Calendar;
import com.minglers.minglespace.calendar.type.CalendarType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
  List<Calendar> findCalendarByWorkspaceIdAndType(Long workspaceId, CalendarType calendarType);
  List<Calendar> findCalendarByWorkspaceIdAndWsMemberId(Long workspaceId, Long wsMemberId);

  @Query("SELECT c FROM Calendar c WHERE c.workspace.id = :workspaceId AND (c.wsMember IS NULL OR c.wsMember.id = :wsMemberId)")
  List<Calendar> findAllByWorkspaceIdAndWsMemberId(@Param("workspaceId") Long workspaceId,
                                                   @Param("wsMemberId") Long wsMemberId );

  //5개, id가 역순 desc, userId기준으로 workspaceID들을 몽땅 조회
  @Query("SELECT c FROM Calendar c " +
          "JOIN c.workspace w " +
          "JOIN w.wsMemberList wm " +
          "JOIN wm.user u " +
          "WHERE u.id = :userId AND c.type = 'NOTICE' " + "ORDER BY c.id DESC")
  List<Calendar> findTop5ByUserIdAndNoticeType(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT c FROM Calendar c " +
          "JOIN c.workspace w " +
          "JOIN w.wsMemberList wm " +
          "JOIN wm.user u " +
          "WHERE u.id = :userId " +
          "AND c.type = 'NOTICE' " +
          "AND c.end BETWEEN :currentDate AND :currentPlusDate " +  // :currentDate를 매개변수로 받기
          "ORDER BY c.end ASC")
  List<Calendar> findCalendarsByUserIdAndNoticeTypeWithEndTimeWithin3Days(
          @Param("userId") Long userId,
          @Param("currentDate") LocalDateTime currentDate,
          @Param("currentPlusDate") LocalDateTime currentPlusDate,
          Pageable pageable);



}
