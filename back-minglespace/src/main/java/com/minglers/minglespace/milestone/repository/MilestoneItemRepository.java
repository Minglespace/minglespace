package com.minglers.minglespace.milestone.repository;

import com.minglers.minglespace.milestone.entity.MilestoneItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MilestoneItemRepository extends JpaRepository<MilestoneItem, Long> {
}
