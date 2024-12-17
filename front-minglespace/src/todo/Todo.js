import React from "react";
import TodoListComponent from "./components/TodoListComponent";

const Todo = () => {
  return (
    <div className="todo_main_container">
      <div className="todo_list_section">
        <TodoListComponent />
      </div>
    </div>
  );
};

export default Todo;
