package com.minglers.minglespace.calendar.controller;

import com.minglers.minglespace.calendar.dto.CalendarRequestDTO;
import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.calendar.entity.Calendar;
import com.minglers.minglespace.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/workspace/{workspaceId}/calendar")
@Slf4j
@RequiredArgsConstructor
public class CalendarController {

  private final CalendarService calendarService;

  @GetMapping("")
  private ResponseEntity<List<CalendarResponseDTO>> getCalendar(@PathVariable("workspaceId") Long workspaceId){
    return ResponseEntity.ok(calendarService.getCalendar(workspaceId));
  }

  @GetMapping("/{calendarId}")
  private ResponseEntity<CalendarResponseDTO> getOneCalendar(@PathVariable("workspaceId") Long workspaceId,
                                                             @PathVariable("calendarId") Long calendarId){
    return ResponseEntity.ok(calendarService.getOneCalendar(workspaceId, calendarId));
  }

  @PostMapping("")
  private ResponseEntity<CalendarResponseDTO> addCalendar(@PathVariable("workspaceId") Long workspaceId,
                             @RequestBody CalendarRequestDTO calendarRequestDTO){
    return ResponseEntity.ok(calendarService.addCalendar(workspaceId, calendarRequestDTO));
  }

  @PutMapping("/{calendarId}")
  private ResponseEntity<CalendarResponseDTO> modifyCalendar(@PathVariable("workspaceId") Long workspaceId,
                                                             @PathVariable("calendarId") Long calendarId,
                                                             @RequestBody CalendarRequestDTO calendarRequestDTO){
    return ResponseEntity.ok(calendarService.modifyCalendar(workspaceId, calendarId, calendarRequestDTO));
  }

  @DeleteMapping("/{calendarId}")
  private ResponseEntity<String> deleteCalendar(@PathVariable("workspaceId") Long workspaceId,
                                                @PathVariable("calendarId") Long calendarId){
    return ResponseEntity.ok(calendarService.deleteCalendar(workspaceId, calendarId));
  }

}
