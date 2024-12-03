package com.minglers.minglespace.milestone.dto;

import lombok.*;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MilestoneResponseDTO {
  private Long id;
  private Long title;

  private List<MilestoneItemResponseDTO> milestoneItemDTOList;
}
