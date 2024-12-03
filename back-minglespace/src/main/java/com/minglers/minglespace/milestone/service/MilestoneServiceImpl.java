package com.minglers.minglespace.milestone.service;

import com.minglers.minglespace.milestone.dto.MilestoneResponseDTO;
import com.minglers.minglespace.milestone.repository.MilestoneGroupRepository;
import com.minglers.minglespace.milestone.repository.MilestoneItemRepository;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MilestoneServiceImpl implements MilestoneService{

  private final MilestoneGroupRepository milestoneGroupRepository;
  private final MilestoneItemRepository milestoneItemRepository;
  private final WorkspaceRepository workspaceRepository;

  @Override
  public List<MilestoneResponseDTO> getMilestone(Long workspaceId) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId)
            .orElseThrow(()-> new IllegalArgumentException("1323"));
    workSpace.getMilestoneGroupList().forEach((msg)->log.info("dd"+msg.toString()));
    return null;
  }
}
