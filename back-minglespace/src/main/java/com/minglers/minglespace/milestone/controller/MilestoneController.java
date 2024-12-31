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
@RequestMapping("/api/workspace/{workspaceId}/milestone")
public class MilestoneController {

  private final MilestoneService milestoneService;


  @GetMapping("")
  public ResponseEntity<List<MilestoneResponseDTO>> getMilestone(@PathVariable("workspaceId") Long workspaceId){
    return ResponseEntity.ok(milestoneService.getMilestone(workspaceId));
  }

  @PostMapping("/milestoneGroup/{milestoneGroupId}")
  public ResponseEntity<MilestoneItemResponseDTO> addMilestoneItem(@PathVariable("milestoneGroupId") Long milestoneGroupId,
                                                                   @RequestBody MilestoneItemRequestDTO milestoneItemRequestDTO){

    return ResponseEntity.ok(milestoneService.addMilestoneItem(milestoneGroupId, milestoneItemRequestDTO));
  }

  @PostMapping("/milestoneGroup")
  public ResponseEntity<MilestoneGroupResponseDTO> addMilestoneGroup(@PathVariable("workspaceId") Long workspaceId,
                                                                     @RequestBody MilestoneGroupRequestDTO milestoneGroupRequestDTO){
    return ResponseEntity.ok(milestoneService.addMilestoneGroup(workspaceId, milestoneGroupRequestDTO));
  }

  @PutMapping("/milestoneGroup/{milestoneGroupId}")
  public ResponseEntity<MilestoneGroupResponseDTO> putMilestoneGroup(@PathVariable("milestoneGroupId") Long milestoneGroupId,
                                                                     @RequestBody MilestoneGroupRequestDTO milestoneGroupRequestDTO){
    return ResponseEntity.ok(milestoneService.putMilestoneGroup(milestoneGroupId, milestoneGroupRequestDTO));
  }

  @PutMapping("/milestoneItem/{milestoneItemId}")
  public ResponseEntity<MilestoneItemResponseDTO> putMilestoneItem(@PathVariable("milestoneItemId") Long milestoneItemId,
                                                                   @RequestBody MilestoneItemRequestDTO milestoneItemRequestDTO){
    log.info(milestoneItemRequestDTO.toString());
    return ResponseEntity.ok(milestoneService.putMilestoneItem(milestoneItemId, milestoneItemRequestDTO));
  }

  @DeleteMapping("/milestoneGroup/{milestoneGroupId}")
  public ResponseEntity<String> deleteMilestoneGroup(@PathVariable("milestoneGroupId") Long milestoneGroupId){

    return ResponseEntity.ok(milestoneService.deleteMilestoneGroup(milestoneGroupId));
  }

  @DeleteMapping("/milestoneItem/{milestoneItemId}")
  public ResponseEntity<String> deleteMilestoneItem(@PathVariable("milestoneItemId") Long milestoneItemId){

    return ResponseEntity.ok(milestoneService.deleteMilestoneItem(milestoneItemId));
  }
}
