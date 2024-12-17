package com.minglers.minglespace.todo.entity;

import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"workSpace", "wsMember", "todoAssigneeList"})
@Entity
@Table(name = "todo")
@Getter
@Builder
public class Todo {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String content;
  @Column(name ="start_date")
  private Long startDate;
  @Column(name="end_date")
  private Long endDate;
  @ColumnDefault("false")
  private boolean complete;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "workspace_id")
  private WorkSpace workSpace;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "creator_id")
  private WSMember wsMember;

  @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  private List<TodoAssignee> todoAssigneeList;

  public void changeWorkSpace(WorkSpace workSpace) {
    this.workSpace = workSpace;
  }

  public void addTodoAssigneeList(List<TodoAssignee> todoAssigneeList) {
    this.todoAssigneeList = todoAssigneeList;
  }

  public void changeTodoAssigneeList(List<TodoAssignee> todoAssigneeList) {
    if (this.todoAssigneeList == null) {
      this.todoAssigneeList = new ArrayList<>();
    }
    this.todoAssigneeList.clear();
    if (todoAssigneeList != null) {
      this.todoAssigneeList.addAll(todoAssigneeList);
      for (TodoAssignee todoAssignee : todoAssigneeList) {
        todoAssignee.changeTodo(this);
      }
    }
  }


  public void changeId(Long id) {
    this.id = id;
  }

  public void changeTitle(String title) {
    this.title = title;
  }

  public void changeContent(String content) {
    this.content = content;
  }

  public void changeStart_date(Long start_date) {
    this.startDate = start_date;
  }

  public void changeEnd_date(Long end_date) {
    this.endDate = end_date;
  }

  public void changeComplete(boolean complete) {
    this.complete = complete;
  }

  public void changeWsMember(WSMember wsMember) {
    this.wsMember = wsMember;
  }
}
