package com.minglers.minglespace.todo.repository;

import com.minglers.minglespace.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
  @Query("SELECT t FROM Todo t JOIN t.todoAssigneeList a WHERE a.wsMember.id = :wsMemberId")
  List<Todo> findTodosByAssigneeWsMemberId(@Param("wsMemberId") Long wsMemberId);
  List<Todo> findAllTodoByWorkSpaceId(Long workspaceId);
}
