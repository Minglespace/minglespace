package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.UserException;
import com.minglers.minglespace.auth.repository.UserFriendRepository;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import com.minglers.minglespace.workspace.dto.FriendWithWorkspaceStatusDTO;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.exception.WorkspaceException;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import com.minglers.minglespace.workspace.role.WSMemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WSMemberServiceImpl implements WSMemberService {

  private final WorkspaceRepository workspaceRepository;
  private final WSMemberRepository wsMemberRepository;
  private final UserRepository userRepository;
  private final UserFriendRepository userFriendRepository;
  private final ModelMapper modelMapper;


  ///////////공통 메서드
  //워크스페이스멤버 가져오기
  private WSMember findWSMemberBy(Long userId, Long workSpaceId){
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId,workSpaceId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스 멤버가 아닙니다"));
  }
  //wsMemberId로 워크스페이스 멤버 조회(pk로)
  private WSMember findById(Long wsMemberId){
    return wsMemberRepository.findById(wsMemberId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스 멤버가 아닙니다"));
  }

  /////////////////////////////////

  //ws멤버조회(유저와, workspaceId)
  @Override
  public WSMember findByUserIdAndWsId(Long userId, Long wsId) {
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId, wsId)
            .orElse(null);
  }

  //워크스페이스에 참여중인 멤버 리스트 조회 유저 정보와 함꼐
  @Override
  public List<MemberWithUserInfoDTO> getWsMemberWithUserInfo(Long workspaceId) {
    List<WSMember> wsMembers = wsMemberRepository.findByWorkSpaceIdOrderByCustomRoleAndUserName(workspaceId);

    List<MemberWithUserInfoDTO> wsMemberList = new ArrayList<>();

    for (WSMember member : wsMembers) {
      User user = member.getUser();

      String imageUriPath = (user.getImage() != null && user.getImage().getUripath() != null) ? user.getImage().getUripath() : "";

      MemberWithUserInfoDTO dto = MemberWithUserInfoDTO.builder()
              .wsMemberId(member.getId())
              .userId(user.getId())
              .email(user.getEmail())
              .name(user.getName())
              .imageUriPath(imageUriPath)
              .position(user.getPosition())
              .phone(user.getPhone())
              .introduction(user.getIntroduction())
              .role(member.getRole().name())
              .build();

      wsMemberList.add(dto);
    }

    return wsMemberList;
  }

  @Override
  public List<WSMember> findByWorkSpaceId(Long workspaceId) {
    return wsMemberRepository.findByWorkSpaceIdOrderByCustomRoleAndUserName(workspaceId);
  }

//친구목록을 불러오는데 내 워크스페이스에 참여중인지 아닌지 구분
  @Override
  @Transactional(readOnly = true)
  public List<FriendWithWorkspaceStatusDTO> getFriendWithWorkspace(Long userId, Long workSpaceId) {
    List<User> userList = userFriendRepository
            .findAllByUserIdAndStatus(userId, FriendshipStatus.ACCEPTED, null);
    return userList.stream().map((user) -> {
      FriendWithWorkspaceStatusDTO friendWithWorkspaceStatusDTO =
              modelMapper.map(user, com.minglers.minglespace.workspace.dto.FriendWithWorkspaceStatusDTO.class);
      friendWithWorkspaceStatusDTO.setInWorkSpace(wsMemberRepository
              .isFriendInWorkSpace(user.getId(), workSpaceId));
      return friendWithWorkspaceStatusDTO;
    }).toList();
  }
//유저를 방에 초대하기
  @Override
  @Transactional
  public String inviteMember(Long friendId, Long workSpaceId) {
    User user = userRepository.findById(friendId)
            .orElseThrow(() -> new UserException(HttpStatus.NOT_FOUND.value(), "유저가 존재하지 않습니다"));
    WorkSpace workSpace = workspaceRepository.findById(workSpaceId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스가 존재하지 않습니다"));
    if (!wsMemberRepository.existsByWorkSpaceIdAndUserId(friendId, workSpaceId)) {
      WSMember wsMember = WSMember.builder()
              .role(WSMemberRole.MEMBER)
              .workSpace(workSpace)
              .user(user)
              .build();
      WSMember savedMember = wsMemberRepository.save(wsMember);
      return savedMember.getUser().getName()+"님 초대에 성공했습니다";
    } else {
      return "이미 워크스페이스에 참여중입니다";
    }
  }
  //멤버 내보내기(리더만가능)
  @Override
  @Transactional
  public String removeMember(Long memberId, Long workSpaceId) {
    WSMember wsMember = findById(memberId);
    wsMemberRepository.delete(wsMember);
    return wsMember.getUser().getName()+"님을 추방하였습니다.";
  }

  //리더 체크하기
  @Override
  @Transactional(readOnly = true)
  public void checkLeader(Long userId, Long workSpaceId) {

    WSMember wsMember = findWSMemberBy(userId,workSpaceId);

    if(WSMemberRole.LEADER != wsMember.getRole())
      throw new WorkspaceException(HttpStatus.UNAUTHORIZED.value(),"워크스페이스 리더가 아닙니다");
  }

  //리더+서브리더 체크하기
  @Override
  @Transactional(readOnly = true)
  public void checkLeaderAndSubLeader(Long userId, Long workSpaceId) {
    WSMember wsMember = findWSMemberBy(userId,workSpaceId);

    if(WSMemberRole.LEADER != wsMember.getRole() && WSMemberRole.SUB_LEADER != wsMember.getRole())
      throw new WorkspaceException(HttpStatus.UNAUTHORIZED.value(),"워크스페이스 리더,서브리더가 아닙니다");
  }

  //유저id+권한 가져오기
  @Override
  @Transactional(readOnly = true)
  public WSMemberResponseDTO getWorkSpaceRole(Long userId, Long workSpaceId) {

    WSMember wsMember = findWSMemberBy(userId,workSpaceId);

    return WSMemberResponseDTO.builder()
            .memberId(wsMember.getId())
            .role(wsMember.getRole().name())
            .build();
  }
  //리더 위임하기
  @Override
  @Transactional
  public String transferLeader(Long userId, Long memberId, Long workspaceId) {
    WSMember wsLeader = findWSMemberBy(userId,workspaceId); //원래 리더확인
    WSMember wsMember = findById(memberId); //멤버 id(ws쪽 pk임)

    wsLeader.changeRole(WSMemberRole.MEMBER);
    WSMember savedMember = wsMemberRepository.save(wsLeader);//리더를 멤버로

    wsMember.changeRole(WSMemberRole.LEADER);
    WSMember savedLeader = wsMemberRepository.save(wsMember);//멤버or서브리더 를 리더로
    return savedLeader.getUser().getName()+"님을 리더로 위임하였습니다.";
  }

  //권한 바꾸기
  @Override
  @Transactional
  public String transferRole(Long workspaceId, Long memberId, String role) {
    WSMember wsMember = findById(memberId);
    if("MEMBER".equals(role))
      wsMember.changeRole(WSMemberRole.MEMBER);
    else if("SUB_LEADER".equals(role))
      wsMember.changeRole(WSMemberRole.SUB_LEADER);
    WSMember savedMember = wsMemberRepository.save(wsMember);

    return savedMember.getUser().getName()+"님의 권한을 "+savedMember.getRole().name()+
            "으로 변경하였습니다";
  }
}
