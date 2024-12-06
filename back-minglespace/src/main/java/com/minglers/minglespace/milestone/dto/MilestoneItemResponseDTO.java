package com.minglers.minglespace.milestone.dto;

import com.minglers.minglespace.milestone.type.TaskStatus;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
public class MilestoneItemResponseDTO {
  private Long id;
  private String title;
  private Long start_time;
  private Long end_time;
  private TaskStatus taskStatus;
}
