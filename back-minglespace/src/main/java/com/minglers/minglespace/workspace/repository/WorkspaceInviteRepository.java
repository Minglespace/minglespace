package com.minglers.minglespace.workspace.repository;

import com.minglers.minglespace.workspace.entity.WorkspaceInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkspaceInviteRepository extends JpaRepository<WorkspaceInvite,Long> {
  Optional<WorkspaceInvite> findByEmail(String email);
  Optional<WorkspaceInvite> findByUuid(String uuid);
}
