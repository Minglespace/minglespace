package com.minglers.minglespace.todo.repository;

import com.minglers.minglespace.todo.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {

  @Query("SELECT t FROM Todo t WHERE t.workSpace.id = :workspaceId AND (" +
          "LOWER(REPLACE(CAST(t.title AS string), ' ', '')) LIKE LOWER(REPLACE(CONCAT('%', :searchKeyword, '%'), ' ', '')) OR " +
          "LOWER(REPLACE(CAST(t.content AS string), ' ', '')) LIKE LOWER(REPLACE(CONCAT('%', :searchKeyword, '%'), ' ', '')))")
  Slice<Todo> findByWorkspaceIdAndTitleOrContent(@Param("workspaceId") Long workspaceId,
                                                 @Param("searchKeyword") String searchKeyword,
                                                 @Param("sortType") String sortType,
                                                 Pageable pageable);

  @Query("SELECT t FROM Todo t JOIN t.todoAssigneeList a WHERE t.workSpace.id = :workspaceId AND LOWER(a.wsMember.user.name) LIKE LOWER(CONCAT('%', :assigneeName, '%'))")
  Slice<Todo> findByWorkspaceIdAndAssigneeName(@Param("workspaceId") Long workspaceId,
                                               @Param("assigneeName") String assigneeName,
                                               Pageable pageable);

  Slice<Todo> findAllTodoByWorkSpaceId(Long workspaceId, Pageable pageable);

  List<Todo> findAllTodoByWorkSpaceId(Long workspaceId);

  @Query("SELECT t FROM Todo t "
          + "JOIN t.workSpace w "
          + "JOIN w.wsMemberList wm "
          + "JOIN t.todoAssigneeList ta "
          + "JOIN ta.wsMember assignee "
          + "JOIN wm.user u "
          + "WHERE u.id = :userId AND assignee.id = wm.id "
          + "AND t.endDate BETWEEN :currentDate AND :currentPlusDate "
          + "ORDER BY t.endDate ASC")
  List<Todo> findTodosByUserIdAndAssigneeId(@Param("userId") Long userId,
                                            @Param("currentDate") LocalDateTime currentDate,
                                            @Param("currentPlusDate") LocalDateTime currentPlusDate,
                                            Pageable pageable);

//  @Query("SELECT t FROM Todo t WHERE t.wsMember.id = :wsMemberId AND t.workSpace.id = :workspaceId")
//  List<Todo> findTodosByCreatorIdAndWorkspaceId(@Param("workspaceId") Long workspaceId, @Param("wsMemberId") Long wsMemberId);
}
