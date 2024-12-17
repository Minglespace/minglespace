package com.minglers.minglespace.workspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name="workspaceInvite")
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceInvite {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String email;

  private String urlLink;

  @ManyToOne(fetch = FetchType.LAZY)
  private WorkSpace workSpace;
}
