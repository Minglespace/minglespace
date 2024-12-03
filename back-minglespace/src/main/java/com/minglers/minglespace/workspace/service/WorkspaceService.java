package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.workspace.dto.WorkspaceDTO;

import java.util.List;

public interface WorkspaceService {
  List<WorkspaceDTO.Response> getList(Long userId);
  WorkspaceDTO.Response resister(Long userId, WorkspaceDTO.Request workspaceDTO);
  WorkspaceDTO.Response modify(Long workSpaceId, WorkspaceDTO.Request workspaceDTO);
  String remove(Long workSpaceId, Long userId);
  WorkspaceDTO.Response getOne(Long workSpaceId);
}
