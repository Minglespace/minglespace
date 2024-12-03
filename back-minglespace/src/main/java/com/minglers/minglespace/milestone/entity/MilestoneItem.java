package com.minglers.minglespace.milestone.entity;

import jakarta.persistence.*;
import lombok.ToString;

@Entity
@Table(name = "milestoneitem")
@ToString
public class MilestoneItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String content;
  private Long start_time;
  private Long end_time;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "milestonegroup_id")
  private MilestoneGroup milestoneGroup;
}
