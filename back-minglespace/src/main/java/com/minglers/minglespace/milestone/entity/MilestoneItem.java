package com.minglers.minglespace.milestone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "milestoneitem")
@ToString(exclude = "milestoneGroup")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class MilestoneItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private Long start_time;
  private Long end_time;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "milestonegroup_id" )
  private MilestoneGroup milestoneGroup;

  public void changeMilestoneGroup(MilestoneGroup milestoneGroup) {
    this.milestoneGroup = milestoneGroup;
  }

  public void changeTitle(String title) {
    this.title = title;
  }

  public void changeStart_time(Long start_time) {
    this.start_time = start_time;
  }

  public void changeEnd_time(Long end_time) {
    this.end_time = end_time;
  }
}
