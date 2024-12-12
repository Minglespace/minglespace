package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.workspace.dto.FriendWithWorkspaceStatusDTO;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
import com.minglers.minglespace.workspace.entity.WSMember;

import java.util.List;

public interface WSMemberService {
  WSMember findByUserIdAndWsId(Long userId, Long wsId);
  List<MemberWithUserInfoDTO> getWsMemberWithUserInfo(Long workspaceId);
  List<WSMember> findByWorkSpaceId(Long workspaceId);

  List<FriendWithWorkspaceStatusDTO> getFriendWithWorkspace(Long userId, Long workSpaceId);
  String inviteMember(Long friendId, Long workSpaceId);
  String removeMember(Long memberId, Long workSpaceId);
  void checkLeader(Long userId, Long workSpaceId);
  void checkLeaderAndSubLeader(Long userId, Long workSpaceId);
  WSMemberResponseDTO getWorkSpaceRole(Long userId, Long workSpaceId);

  String transferLeader(Long userId, Long memberId, Long workspaceId);
  String transferRole(Long workspaceId, Long memberId, String role);
}
