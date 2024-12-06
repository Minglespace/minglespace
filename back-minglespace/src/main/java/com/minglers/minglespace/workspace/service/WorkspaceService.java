package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
import com.minglers.minglespace.workspace.dto.WorkSpaceResponseDTO;
import com.minglers.minglespace.workspace.dto.WorkspaceRequestDTO;
import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;

import java.util.List;

public interface WorkspaceService {
  List<WorkSpaceResponseDTO> getList(Long userId);
  WorkSpaceResponseDTO resister(Long userId, WorkspaceRequestDTO workspaceDTO);
  WorkSpaceResponseDTO modify(Long workSpaceId, WorkspaceRequestDTO workspaceDTO);
  String remove(Long workSpaceId, Long userId);
  WorkSpaceResponseDTO getOne(Long workSpaceId);
  void checkLeader(Long userId, Long workSpaceId);
  WSMemberResponseDTO getWorkSpaceRole(Long userId, Long workSpaceId);
  List<MemberWithUserInfoDTO> getWsMemberWithUserInfo(Long workspaceId);
}
