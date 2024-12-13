package com.minglers.minglespace.todo.repository;

import com.minglers.minglespace.todo.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
  @Query("SELECT t FROM Todo t JOIN t.todoAssigneeList a WHERE a.wsMember.id = :wsMemberId")
  List<Todo> findTodosByAssigneeWsMemberId(@Param("wsMemberId") Long wsMemberId);

  //  Query("SELECT t FROM Todo t WHERE t.workSpace.id = :workspaceId AND (t.title LIKE %:searchKeyword% OR t.content LIKE %:searchKeyword)")
//  @Query("SELECT t FROM Todo t WHERE t.workSpace.id = :workspaceId AND " +
//          "(:searchKeyword IS NULL OR " +
//          "CONCAT(t.title, ' ', t.content) LIKE %:searchKeyword%)")
  @Query("SELECT t FROM Todo t WHERE t.workSpace.id = :workspaceId AND " +
          "(LOWER(REPLACE(CAST(t.title AS string), ' ', '')) LIKE LOWER(REPLACE(CONCAT('%', :searchKeyword, '%'), ' ', '')) OR " +
          "LOWER(REPLACE(CAST(t.content AS string), ' ', '')) LIKE LOWER(REPLACE(CONCAT('%', :searchKeyword, '%'), ' ', '')))")
  List<Todo> findByWorkspaceIdAndTitleOrContent(@Param("workspaceId") Long workspaceId, @Param("searchKeyword") String searchKeyword);

  @Query("SELECT t FROM Todo t JOIN t.todoAssigneeList a WHERE t.workSpace.id = :workspaceId AND LOWER(a.wsMember.user.name) LIKE LOWER(CONCAT('%', :assigneeName, '%'))")
  List<Todo> findByWorkspaceIdAndAssigneeName(@Param("workspaceId") Long workspaceId, @Param("assigneeName") String assigneeName);

  List<Todo> findAllTodoByWorkSpaceId(Long workspaceId);
}
