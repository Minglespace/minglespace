import React from "react";
import { useEffect, useState, useContext } from "react";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";
import TodoApi from "../../api/TodoApi";
import { useParams } from "react-router-dom";
import TodoItem from "./TodoItem";

const initTodo = [
  {
    id: 0,
    title: "",
    content: "",
    start_date: 0,
    end_date: 0,
    complete: false,
    creator_id: 1,
  },
];
const TodoLeaderComponent = () => {
  const [todoItem, setTodoItem] = useState([...initTodo]);
  const { workspaceId } = useParams("workspaceId");
  const { memberId, role } = useContext(WSMemberRoleContext);

  useEffect(() => {
    TodoApi.getAllList(workspaceId).then((data) => {
      const updateTodo = data.map(
        ({
          id,
          title,
          content,
          start_date,
          end_date,
          complete,
          creator_id,
        }) => ({
          id: id,
          title: title,
          content: content,
          start_date: start_date,
          end_date: end_date,
          complete: complete,
          creator_id: creator_id,
        })
      );
      setTodoItem(updateTodo);
      console.log("todo:", updateTodo);
    });
  }, [workspaceId]);

  return (
    <div className="todo_list_contents">
      <button>할일 추가</button>
      {todoItem.map((todo) => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          title={todo.title}
          content={todo.content}
          start_date={todo.start_date}
          end_date={todo.end_date}
          creator_id={todo.creator_id}
          complete={todo.complete}
        />
      ))}
    </div>
  );
};

export default TodoLeaderComponent;
