package com.minglers.minglespace.workspace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="workspaceInvite")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class WorkspaceInvite {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String email;

  private String urlLink;

  private String uuid;

  private LocalDateTime expirationTime;

  @ManyToOne(fetch = FetchType.LAZY)
  private WorkSpace workSpace;
}
