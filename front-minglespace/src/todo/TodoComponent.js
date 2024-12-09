import React from "react";
import { useEffect, useState } from "react";
import TodoApi from "../api/TodoApi";
import { useParams } from "react-router-dom";

const wsmemberId = 1;

const initTodo = [
  {
    id: 0,
    title: "",
    content: "",
    start_date: 0,
    end_date: 0,
    complete: false,
  },
];
const TodoComponent = () => {
  const [todoItem, setTodoItem] = useState([...initTodo]);
  const { workspaceId } = useParams("workspaceId");

  useEffect(() => {
    TodoApi.getList(workspaceId).then((data) => {
      const updateTodo = data.map(
        ({ id, title, content, start_date, end_date, complete }) => ({
          id: id,
          title: title,
          content: content,
          start_date: start_date,
          end_date: end_date,
          complete: complete,
        })
      );
      setTodoItem(updateTodo);
      console.log("todo:", updateTodo);
    });
  }, [workspaceId]);

  return <div></div>;
};

export default TodoComponent;
