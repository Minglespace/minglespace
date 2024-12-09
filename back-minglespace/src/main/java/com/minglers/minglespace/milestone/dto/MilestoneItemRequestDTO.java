package com.minglers.minglespace.milestone.dto;

import com.minglers.minglespace.milestone.type.TaskStatus;
import lombok.*;
import org.springframework.scheduling.config.Task;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString
public class MilestoneItemRequestDTO {
  private Long id;
  private String title;
  private Long start_time;
  private Long end_time;
  private TaskStatus taskStatus;
}
