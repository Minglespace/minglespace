package com.minglers.minglespace.calendar.entity;

import com.minglers.minglespace.calendar.type.CalendarType;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "calendar")
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Builder
public class Calendar{
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String title;
  private LocalDateTime start;

  private LocalDateTime end;
  private String description;

  @Enumerated(EnumType.STRING)
  private CalendarType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workspaceId")
  private WorkSpace workspace;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name= "wsMemberId")
  private WSMember wsMember;

  public void changeWsMember(WSMember wsMember){
    this.wsMember = wsMember;
  }

  public void changeWorkspace(WorkSpace workspace) {
    this.workspace = workspace;
  }

  public void changeTitle(String title) {
    this.title = title;
  }

  public void changeStart(LocalDateTime start) {
    this.start = start;
  }

  public void changeEnd(LocalDateTime end) {
    this.end = end;
  }

  public void changeDescription(String description) {
    this.description = description;
  }
}
