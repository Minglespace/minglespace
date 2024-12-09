package com.minglers.minglespace.milestone.dto;

import lombok.*;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Setter
public class MilestoneResponseDTO {
  private Long id;
  private String title;

  private List<MilestoneItemResponseDTO> milestoneItemDTOList;
}
