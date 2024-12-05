package com.minglers.minglespace.milestone.controller;

import com.minglers.minglespace.milestone.dto.*;
import com.minglers.minglespace.milestone.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/workspace/{workspaceId}/milestone")
public class MilestoneController {

  private final MilestoneService milestoneService;


  @GetMapping("")
  public ResponseEntity<List<MilestoneResponseDTO>> getMilestone(@PathVariable("workspaceId") Long workspaceId){
    return ResponseEntity.ok(milestoneService.getMilestone(workspaceId));
  }

  @PostMapping("/milestoneGroup/{milestoneGroupId}")
  public ResponseEntity<MilestoneItemResponseDTO> addMilestoneItem(@PathVariable("milestoneGroupId") Long milestoneGroupId,
                                                                   @RequestBody MilestoneItemRequestDTO milestoneItemRequestDTO){
    log.info(milestoneItemRequestDTO.toString());
    return ResponseEntity.ok(milestoneService.addMilestoneItem(milestoneGroupId, milestoneItemRequestDTO));
  }

  @PostMapping("/milestoneGroup")
  public ResponseEntity<MilestoneGroupResponseDTO> addMilestoneGroup(@PathVariable("workspaceId") Long workspaceId,
                                                                     @RequestBody MilestoneGroupRequestDTO milestoneGroupRequestDTO){

//    log.info(workspaceId.toString());
//    log.info(milestoneGroupRequestDTO);
    return ResponseEntity.ok(milestoneService.addMilestoneGroup(workspaceId, milestoneGroupRequestDTO));
  }
}
