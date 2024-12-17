import React from "react";
import Todo from "../todo/Todo";
import BasicLayout from "../common/Layouts/BasicLayout";

const TodoPage = () => {
  return (
    <BasicLayout props="1">
      <Todo />
    </BasicLayout>
  );
};

export default TodoPage;
