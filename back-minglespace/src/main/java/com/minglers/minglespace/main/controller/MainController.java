package com.minglers.minglespace.main.controller;

import com.minglers.minglespace.calendar.dto.CalendarResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/main")
public class MainController {
  @GetMapping("")
  public ResponseEntity<List<>>
}
