package com.minglers.minglespace.milestone.service;

import com.minglers.minglespace.milestone.dto.*;

import java.util.List;

public interface MilestoneService {
  List<MilestoneResponseDTO> getMilestone(Long workspaceId);
  MilestoneGroupResponseDTO addMilestoneGroup(Long workspaceId, MilestoneGroupRequestDTO milestoneGroupRequestDTO);
  MilestoneItemResponseDTO addMilestoneItem(Long milestoneGroupId, MilestoneItemRequestDTO milestoneItemRequestDTO);
}
