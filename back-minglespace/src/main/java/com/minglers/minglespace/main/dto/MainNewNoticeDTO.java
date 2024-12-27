package com.minglers.minglespace.main.dto;

import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class MainNewNoticeDTO {
  private String workspaceName;
  private String title;
  private String description;
  private LocalDateTime start;
  private LocalDateTime end;
  private String path;
}
