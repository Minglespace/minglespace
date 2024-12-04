package com.minglers.minglespace.milestone.dto;

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
}
