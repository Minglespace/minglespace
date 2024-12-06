package com.minglers.minglespace.workspace.repository;

import com.minglers.minglespace.workspace.entity.WSMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WSMemberRepository extends JpaRepository<WSMember,Long> {
  Optional<WSMember> findByUserIdAndWorkSpaceId(Long userId, Long workspaceId);
  List<WSMember> findByWorkSpaceId(Long workspaceId);
}
