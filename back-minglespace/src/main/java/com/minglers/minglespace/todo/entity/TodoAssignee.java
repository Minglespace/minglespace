package com.minglers.minglespace.todo.entity;

import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name="todoassignee")
@Getter
@Builder
public class TodoAssignee {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "todo_id")
  private Todo todo;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "wsmember_id")
  private WSMember wsMember;
}
