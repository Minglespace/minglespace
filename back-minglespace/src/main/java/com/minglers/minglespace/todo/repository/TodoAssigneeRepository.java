package com.minglers.minglespace.todo.repository;

import com.minglers.minglespace.todo.entity.Todo;
import com.minglers.minglespace.todo.entity.TodoAssignee;
import com.minglers.minglespace.workspace.entity.WSMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TodoAssigneeRepository extends JpaRepository<TodoAssignee, Long> {

  @Query("SELECT ta.todo FROM TodoAssignee ta WHERE ta.todo.workSpace.id = :workspaceId AND ta.wsMember.id = :wsMemberId")
  List<Todo> findAllTodoByWorkspaceIdAndWsMemberId(@Param("workspaceId") Long workspaceId,
                                                   @Param("wsMemberId") Long wsMemberId);

}
