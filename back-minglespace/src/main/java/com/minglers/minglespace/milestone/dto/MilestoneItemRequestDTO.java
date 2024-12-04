package com.minglers.minglespace.milestone.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString
public class MilestoneItemRequestDTO {
  private Long id;
  private String title;
  private Long start_time;
  private Long end_time;
}
