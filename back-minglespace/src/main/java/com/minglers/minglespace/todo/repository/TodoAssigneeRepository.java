package com.minglers.minglespace.todo.repository;

import com.minglers.minglespace.todo.entity.TodoAssignee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoAssigneeRepository extends JpaRepository<TodoAssignee, Long> {
}
