package com.minglers.minglespace.milestone.entity;

import com.minglers.minglespace.workspace.entity.WorkSpace;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "milestonegroup")
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
public class MilestoneGroup {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workspace_id")
  private WorkSpace workspace;

  @OneToMany(mappedBy = "milestoneGroup", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
  private List<MilestoneItem> milestoneItemList;

  public void changeWorkspace(WorkSpace workspace) {
    this.workspace = workspace;
  }

  public void changeTitle(String title) {
    this.title = title;
  }
}
