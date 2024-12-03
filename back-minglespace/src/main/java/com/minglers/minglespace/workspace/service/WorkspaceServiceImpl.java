package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.workspace.dto.WorkspaceDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import com.minglers.minglespace.workspace.role.WSMemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceServiceImpl implements WorkspaceService{

  private final ModelMapper modelMapper;

  private final UserRepository userRepository;

  private final WorkspaceRepository workspaceRepository;

  private final WSMemberRepository wsMemberRepository;

  //공통 메서드////////////////
  //유저 정보 가져오기
  private User findUserById(Long userId){
    return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("유저정보를 찾을수 없습니다."));
  }

  //워크스페이스 가져오기
  private WorkSpace findWorkSpaceById(Long workSpaceId){
    return workspaceRepository.findById(workSpaceId)
            .orElseThrow(()->new IllegalArgumentException("워크스페이스를 찾을수 없습니다."));
  }

  //워크스페이스 삭제여부체크
  private void checkDelflag(WorkSpace workSpace){
    if(workSpace.isDelflag())
      throw new RuntimeException("삭제된 워크스페이스입니다.");
  }

  //워크스페이스 엔티티를 DTO 로 변환
  private WorkspaceDTO.Response workspaceDtoFromEntity(WorkSpace workSpace){
    return modelMapper.map(workSpace, WorkspaceDTO.Response.class);
  }

  //워크스페이스 DTO를 entity로 변환
  private WorkSpace workspaceEntityFromRequest(WorkspaceDTO.Request request){
    return modelMapper.map(request, WorkSpace.class);
  }

  ///////////////////////////

  //사이드바에서 workspace 클릭시 보여주는 리스트
  @Override
  @Transactional(readOnly = true)
  public List<WorkspaceDTO.Response> getList(Long userId) {
    return findUserById(userId).getWsMembers().stream()
            .filter((wsMember) -> !wsMember.getWorkSpace().isDelflag()) //삭제된 워크스페이스는 제외
            .map((wsMember) -> {//워크스페이스 조회후 카운트 추가
              WorkSpace workSpace = wsMember.getWorkSpace();
              WorkspaceDTO.Response response = workspaceDtoFromEntity(workSpace);
              response.setCount(workSpace.getWorkSpaceList().size());
              return response;
            }).toList();
  }

  //workspace 추가
  @Override
  @Transactional
  public WorkspaceDTO.Response resister(Long userId,WorkspaceDTO.Request workspaceDTO) {
    User user = findUserById(userId);

    WorkSpace targetWorkSpace = workspaceEntityFromRequest(workspaceDTO);
    WorkSpace savedWorkSpace = workspaceRepository.save(targetWorkSpace);

    WSMember targetwsMember = WSMember.builder()
            .user(user)
            .workSpace(savedWorkSpace)
            .role(WSMemberRole.LEADER)
            .build();
    WSMember savedWSMeber = wsMemberRepository.save(targetwsMember);

    WorkspaceDTO.Response response = workspaceDtoFromEntity(savedWorkSpace);
    response.setCount(1);//처음 참여인원은 무조건1로 리턴

    return response;
  }

  //workspace수정
  @Override
  @Transactional
  public WorkspaceDTO.Response modify(Long workSpaceId, WorkspaceDTO.Request workspaceDTO) {
    //원본 가져오고 수정해서 save하기
    WorkSpace workSpace = findWorkSpaceById(workSpaceId);
    checkDelflag(workSpace);

    workSpace.changeName(workspaceDTO.getName());
    workSpace.changeWsdesc(workspaceDTO.getWsdesc());

    WorkSpace savedWorkSpace = workspaceRepository.save(workSpace);

    return workspaceDtoFromEntity(savedWorkSpace);
  }

  //workspace삭제
  @Override
  @Transactional
  public String remove(Long workSpaceId, Long userId) {
    //원본 가져오고 수정해서 save하기 delflag,날짜,삭제id만 바꿔주기
    WorkSpace workSpace = findWorkSpaceById(workSpaceId);
    checkDelflag(workSpace);

    workSpace.changeDelflag(true);
    workSpace.changeDeletedByUserId(userId);
    workSpace.changeDeletedAt(LocalDateTime.now());

    WorkSpace savedWorkSpace = workspaceRepository.save(workSpace);

    if (savedWorkSpace.getId() != null)
      return "success";
    return "fail";
  }

  //하나만 조회하기
  @Override
  @Transactional(readOnly = true)
  public WorkspaceDTO.Response getOne(Long workSpaceId) {

    WorkSpace workSpace = findWorkSpaceById(workSpaceId);
    checkDelflag(workSpace);

    WorkspaceDTO.Response response = workspaceDtoFromEntity(workSpace);
    response.setCount(workSpace.getWorkSpaceList().size());

    return response;
  }
}


