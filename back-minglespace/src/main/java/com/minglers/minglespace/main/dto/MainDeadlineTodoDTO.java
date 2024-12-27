package com.minglers.minglespace.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class MainDeadlineTodoDTO {
  private String workspaceName;
  private String title;
  private String description;
  private LocalDateTime start;
  private LocalDateTime end;
  private String path;
}
