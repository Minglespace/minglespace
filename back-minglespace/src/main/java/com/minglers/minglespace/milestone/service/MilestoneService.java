package com.minglers.minglespace.milestone.service;

import com.minglers.minglespace.milestone.dto.MilestoneResponseDTO;

import java.util.List;

public interface MilestoneService {
  List<MilestoneResponseDTO> getMilestone(Long workspaceId);
}
