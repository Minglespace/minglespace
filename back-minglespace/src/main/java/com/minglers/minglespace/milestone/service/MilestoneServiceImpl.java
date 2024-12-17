package com.minglers.minglespace.milestone.service;

import com.minglers.minglespace.milestone.dto.*;
import com.minglers.minglespace.milestone.entity.MilestoneGroup;
import com.minglers.minglespace.milestone.entity.MilestoneItem;
import com.minglers.minglespace.milestone.exception.MilestoneException;
import com.minglers.minglespace.milestone.repository.MilestoneGroupRepository;
import com.minglers.minglespace.milestone.repository.MilestoneItemRepository;
import com.minglers.minglespace.milestone.type.TaskStatus;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.exception.WorkspaceException;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.jdbc.Work;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
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
            .orElseThrow(()-> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을수 없습니다."));

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
    WorkSpace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스를 찾을수 없습니다."));
    MilestoneGroup milestoneGroup = modelMapper.map(milestoneGroupRequestDTO, MilestoneGroup.class);
    milestoneGroup.changeWorkspace(workspace);

    MilestoneGroup resultMilestoneGroup = milestoneGroupRepository.save(milestoneGroup);

    return modelMapper.map(resultMilestoneGroup, MilestoneGroupResponseDTO.class);
  }

  @Override
  @Transactional
  public MilestoneItemResponseDTO addMilestoneItem(Long milestoneGroupId, MilestoneItemRequestDTO milestoneItemRequestDTO) {
    MilestoneGroup milestoneGroup = milestoneGroupRepository.findById(milestoneGroupId)
            .orElseThrow(()-> new MilestoneException(HttpStatus.NOT_FOUND.value(), "마일스톤 그룹이 존재하지 않습니다."));
    // 1. 그룹 아이디를 조회
    // 2. Request를 DB에 저장해야하므로
    // 3. Entity로 변환해야한다.
    // 4. Repository로 save작동
    // 5. 리턴된 값을 컨트롤러로 반환한다.

    MilestoneItem milestoneItem = modelMapper.map(milestoneItemRequestDTO, MilestoneItem.class);
    log.info(milestoneItem.toString());
    milestoneItem.changeMilestoneGroup(milestoneGroup);

    MilestoneItem resultMilestoneItem = milestoneItemRepository.save(milestoneItem);

    return modelMapper.map(resultMilestoneItem, MilestoneItemResponseDTO.class);
  }

  @Override
  @Transactional
  public MilestoneGroupResponseDTO putMilestoneGroup(Long milestoneGroupId, MilestoneGroupRequestDTO milestoneGroupRequestDTO) {
    // 1. 워크스페이스 아이디를 조회
    // 2. RequestDTO 를 Entity로 변환
    // 3. DB에 변경사항 저장
    // 4. 저장하면서 발생한 Return을 DTO로 변환
    // 5. 변환된 DTO를 다시 return하여 컨트롤러로 보냄
    MilestoneGroup milestoneGroup = milestoneGroupRepository.findById(milestoneGroupId)
            .orElseThrow(()-> new MilestoneException(HttpStatus.NOT_FOUND.value(), "마일스톤 그룹이 존재하지 않습니다."));
    milestoneGroup.changeTitle(milestoneGroupRequestDTO.getTitle());

    MilestoneGroup resultMilestoneGroup = milestoneGroupRepository.save(milestoneGroup);
    return modelMapper.map(resultMilestoneGroup, MilestoneGroupResponseDTO.class);
  }

  @Override
  @Transactional
  public MilestoneItemResponseDTO putMilestoneItem(Long milestoneItemId, MilestoneItemRequestDTO milestoneItemRequestDTO) {
    MilestoneItem milestoneItem = milestoneItemRepository.findById(milestoneItemId)
            .orElseThrow(() -> new MilestoneException(HttpStatus.NOT_FOUND.value(), "마일스톤 아이템이 존재하지 않습니다."));
    milestoneItem.changeTitle(milestoneItemRequestDTO.getTitle());
    milestoneItem.changeStart_time(milestoneItemRequestDTO.getStart_time());
    milestoneItem.changeEnd_time(milestoneItemRequestDTO.getEnd_time());
    milestoneItem.changeTaskStatus(milestoneItemRequestDTO.getTaskStatus());

    MilestoneItem resultMilestoneItem = milestoneItemRepository.save(milestoneItem);
    return modelMapper.map(resultMilestoneItem, MilestoneItemResponseDTO.class);
  }

  @Override
  @Transactional
  public String deleteMilestoneGroup(Long milestoneGroupId) {
    MilestoneGroup milestoneGroup = milestoneGroupRepository.findById(milestoneGroupId)
            .orElseThrow(() -> new MilestoneException(HttpStatus.NOT_FOUND.value(), "마일스톤 그룹이 존재하지 않습니다."));

    milestoneGroupRepository.deleteById(milestoneGroup.getId());

    return "GROUP DELETE SUCCESS";
  }

  @Override
  public String deleteMilestoneItem(Long milestoneItemId) {
    MilestoneItem milestoneItem = milestoneItemRepository.findById(milestoneItemId)
            .orElseThrow(() -> new MilestoneException(HttpStatus.NOT_FOUND.value(), "마일스톤 아이템이 존재하지 않습니다."));
    milestoneItemRepository.deleteById(milestoneItem.getId());

    return "ITEM DELETE SUCCESS";
  }
}
