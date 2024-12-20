package com.minglers.minglespace.milestone.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class MilestoneTaskStatusDTO {
  private int total;
  private int not_start;
  private int in_progress;
  private int completed;
  private int on_hold;
}
