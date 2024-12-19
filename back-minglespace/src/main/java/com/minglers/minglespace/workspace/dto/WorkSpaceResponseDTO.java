package com.minglers.minglespace.workspace.dto;

import com.minglers.minglespace.milestone.dto.MilestoneTaskStatusDTO;
import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WorkSpaceResponseDTO {
  private Long id;
  private String name;
  private String wsdesc;
  private int count;

  private MilestoneTaskStatusDTO milestoneTaskStatusDTO;

}
