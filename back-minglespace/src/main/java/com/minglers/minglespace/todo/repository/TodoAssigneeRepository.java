package com.minglers.minglespace.todo.repository;

import com.minglers.minglespace.todo.entity.Todo;
import com.minglers.minglespace.todo.entity.TodoAssignee;
import com.minglers.minglespace.workspace.entity.WSMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoAssigneeRepository extends JpaRepository<TodoAssignee, Long> {

  List<Todo> findAllByWsMemberId(Long wsMemberId);

}
