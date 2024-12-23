package com.minglers.minglespace.milestone.repository;

import com.minglers.minglespace.milestone.entity.MilestoneGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneGroupRepository extends JpaRepository<MilestoneGroup, Long> {
  List<MilestoneGroup> findMilestoneGroupByWorkspaceId(Long workspaceId);

}
