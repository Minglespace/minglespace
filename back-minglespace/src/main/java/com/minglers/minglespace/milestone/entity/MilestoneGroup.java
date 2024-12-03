package com.minglers.minglespace.milestone.entity;

import com.minglers.minglespace.workspace.entity.WorkSpace;
import jakarta.persistence.*;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "milestonegroup")
@ToString
public class MilestoneGroup {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workspace_id")
  private WorkSpace workspace;

  @OneToMany(mappedBy = "milestoneGroup", fetch = FetchType.LAZY)
  private List<MilestoneItem> milestoneItemList;
}
