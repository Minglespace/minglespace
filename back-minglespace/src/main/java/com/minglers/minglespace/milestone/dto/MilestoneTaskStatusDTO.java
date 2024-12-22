package com.minglers.minglespace.milestone.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class MilestoneTaskStatusDTO {
  private int total = 0;
  private int not_start = 0;
  private int in_progress = 0;
  private int completed = 0;
  private int on_hold = 0;
}
