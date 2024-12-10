import React, { useContext } from "react";
import { useEffect, useState } from "react";
import TodoApi from "../../api/TodoApi";
import { useParams } from "react-router-dom";
import TodoItem from "./TodoItem";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";

const wsmemberId = 2;

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
const TodoComponent = () => {
  const [todoItem, setTodoItem] = useState([...initTodo]);
  const { workspaceId } = useParams("workspaceId");
  const { role } = useContext(WSMemberRoleContext);

  useEffect(() => {
    TodoApi.getList(workspaceId, wsmemberId).then((data) => {
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
    <div className="todo_item_container">
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
      {/* <div className="todo_button_container">
        {role === "LEADER" ? (
          <>
            <button>수정하기</button>
            <button>삭제하기</button>
          </>
        ) : (
          <></>
        )}
        <button>돌아가기</button>
      </div> */}
    </div>
  );
};

export default TodoComponent;
