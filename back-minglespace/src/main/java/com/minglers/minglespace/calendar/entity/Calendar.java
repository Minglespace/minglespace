package com.minglers.minglespace.calendar.entity;

import com.minglers.minglespace.workspace.entity.WorkSpace;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "calendar")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class Calendar{
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String title;
  private LocalDateTime start;
  private String description;


  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workspaceId")
  private WorkSpace workspace;

  public void changeWorkspace(WorkSpace workspace) {
    this.workspace = workspace;
  }

  public void changeTitle(String title) {
    this.title = title;
  }

  public void changeStart(LocalDateTime start) {
    this.start = start;
  }

  public void changeDescription(String description) {
    this.description = description;
  }
}
