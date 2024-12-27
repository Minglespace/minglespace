package com.minglers.minglespace.main.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class MainDeadlineNoticeDTO {
  private String workspaceName;
  private String title;
  private String description;
  private LocalDateTime start;
  private LocalDateTime end;
  private String path;
}
