package com.minglers.minglespace.milestone.repository;

import com.minglers.minglespace.milestone.entity.MilestoneGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MilestoneGroupRepository extends JpaRepository<MilestoneGroup, Long> {

}
