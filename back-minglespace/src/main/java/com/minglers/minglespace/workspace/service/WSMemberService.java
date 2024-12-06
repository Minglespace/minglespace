package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.workspace.entity.WSMember;

import java.util.List;

public interface WSMemberService {
  WSMember findByUserIdAndWsId(Long userId, Long wsId);
  List<WSMember> findByWorkSpaceId(Long workspaceId);
}
