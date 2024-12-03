package com.minglers.minglespace.milestone.controller;

import com.minglers.minglespace.milestone.dto.MilestoneResponseDTO;
import com.minglers.minglespace.milestone.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RequiredArgsConstructor
@RestController
@RequestMapping("/workspace/{workspaceId}/milestone")
public class MilestoneController {

  private final MilestoneService milestoneService;


  @GetMapping("")
  public List<MilestoneResponseDTO> getMilestone(@PathVariable("workspaceId") Long workspaceId){
    milestoneService.getMilestone(workspaceId);
    return null;
  }
}
