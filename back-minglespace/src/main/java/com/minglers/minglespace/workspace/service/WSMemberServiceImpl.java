package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.UserException;
import com.minglers.minglespace.auth.repository.UserFriendRepository;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import com.minglers.minglespace.workspace.dto.FriendWithWorkspaceStatusDTO;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
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

  @Override
  public WSMember findByUserIdAndWsId(Long userId, Long wsId) {
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId, wsId)
            .orElse(null);
  }

  @Override
  public List<MemberWithUserInfoDTO> getWsMemberWithUserInfo(Long workspaceId) {
    List<WSMember> wsMembers = wsMemberRepository.findByWorkSpaceIdOrderByUserNameAsc(workspaceId);

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
    return wsMemberRepository.findByWorkSpaceIdOrderByUserNameAsc(workspaceId);
  }


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
      wsMemberRepository.save(wsMember);
      return "초대에 성공했습니다";
    } else {
      return "이미 워크스페이스에 참여중입니다";
    }
  }
}
