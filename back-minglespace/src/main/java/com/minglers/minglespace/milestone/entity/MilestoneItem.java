package com.minglers.minglespace.milestone.entity;

import com.minglers.minglespace.milestone.type.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

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


  @Enumerated(EnumType.STRING)
  @ColumnDefault("'NOT_START'")
  private TaskStatus taskStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "milestonegroup_id" )
  private MilestoneGroup milestoneGroup;

  public void changeTaskStatus(TaskStatus taskStatus) {
    this.taskStatus = taskStatus;
  }
  
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
