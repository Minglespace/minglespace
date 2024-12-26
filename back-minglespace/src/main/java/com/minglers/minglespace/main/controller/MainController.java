package com.minglers.minglespace.main.controller;

import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import com.minglers.minglespace.main.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/main")
@RequiredArgsConstructor
public class MainController {
  private final JWTUtils jwtUtils;
  private final MainService mainService;

  @GetMapping("")
  public ResponseEntity<Map<String, Object>> getMainContent(@RequestHeader("Authorization") String token){
    Long userId = jwtUtils.extractUserId(token.substring(7));

    return ResponseEntity.ok(mainService.getMainContent(userId));
  }
}
