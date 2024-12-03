package com.minglers.minglespace.milestone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.ToString;
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MilestoneItemResponseDTO {
    private Long id;
    private String content;
    private Long start_time;
    private Long end_time;
  }
