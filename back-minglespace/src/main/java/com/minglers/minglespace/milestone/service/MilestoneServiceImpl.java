package com.minglers.minglespace.milestone.service;

import com.minglers.minglespace.milestone.dto.*;
import com.minglers.minglespace.milestone.entity.MilestoneGroup;
import com.minglers.minglespace.milestone.entity.MilestoneItem;
import com.minglers.minglespace.milestone.repository.MilestoneGroupRepository;
import com.minglers.minglespace.milestone.repository.MilestoneItemRepository;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.jdbc.Work;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MilestoneServiceImpl implements MilestoneService{

  private final MilestoneGroupRepository milestoneGroupRepository;
  private final MilestoneItemRepository milestoneItemRepository;
  private final WorkspaceRepository workspaceRepository;
  private final ModelMapper modelMapper;

  @Override
  @Transactional(readOnly = true)
  public List<MilestoneResponseDTO> getMilestone(Long workspaceId) {
    WorkSpace workSpace = workspaceRepository.findById(workspaceId)
            .orElseThrow(()-> new IllegalArgumentException("1323"));

    return workSpace.getMilestoneGroupList().stream().map((msg)->{
      MilestoneResponseDTO milestoneResponseDTO = modelMapper.map(msg, MilestoneResponseDTO.class);

      List<MilestoneItemResponseDTO> milestoneItemResponseDTOS =  msg.getMilestoneItemList().stream().map((msi) ->{
        return modelMapper.map(msi, MilestoneItemResponseDTO.class);
      }).toList();
      milestoneResponseDTO.setMilestoneItemDTOList(milestoneItemResponseDTOS);
      return milestoneResponseDTO;
    }).toList();
  }

  @Override
  @Transactional
  public MilestoneGroupResponseDTO addMilestoneGroup(Long workspaceId, MilestoneGroupRequestDTO milestoneGroupRequestDTO) {
    WorkSpace workspace = workspaceRepository.findById(workspaceId).orElseThrow(() -> new IllegalArgumentException("잘못된 워크스페이스 ID"));
    MilestoneGroup milestoneGroup = modelMapper.map(milestoneGroupRequestDTO, MilestoneGroup.class);
    milestoneGroup.changeWorkspace(workspace);

    MilestoneGroup resultMilestoneGroup = milestoneGroupRepository.save(milestoneGroup);

    return modelMapper.map(resultMilestoneGroup, MilestoneGroupResponseDTO.class);
  }

  @Override
  @Transactional
  public MilestoneItemResponseDTO addMilestoneItem(Long milestoneGroupId, MilestoneItemRequestDTO milestoneItemRequestDTO) {
    MilestoneGroup milestoneGroup = milestoneGroupRepository.findById(milestoneGroupId).orElseThrow(()-> new IllegalArgumentException("오류"));
    // 1. 그룹 아이디를 조회
    // 2. Request를 DB에 저장해야하므로
    // 3. Entity로 변환해야한다.
    // 4. Repository로 save작동
    // 5. 리턴된 값을 컨트롤러로 반환한다.

    MilestoneItem milestoneItem = modelMapper.map(milestoneItemRequestDTO, MilestoneItem.class);
    milestoneItem.changeMilestoneGroup(milestoneGroup);

    MilestoneItem resultMilestoneItem = milestoneItemRepository.save(milestoneItem);

    return modelMapper.map(resultMilestoneItem, MilestoneItemResponseDTO.class);
  }



}
