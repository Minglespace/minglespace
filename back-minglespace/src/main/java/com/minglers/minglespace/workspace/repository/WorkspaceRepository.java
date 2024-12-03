package com.minglers.minglespace.workspace.repository;

import com.minglers.minglespace.workspace.entity.WorkSpace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceRepository extends JpaRepository<WorkSpace,Long> {
}
