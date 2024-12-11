import React, { useContext } from "react";
import { useEffect, useState } from "react";
import TodoApi from "../../api/TodoApi";
import { useParams } from "react-router-dom";
import TodoItem from "./TodoItem";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";

const TodoComponent = () => {
  const [todoItem, setTodoItem] = useState([]);
  const { workspaceId } = useParams("workspaceId");
  const { role } = useContext(WSMemberRoleContext);

  // console.log(todoItem);
  // useEffect(() => {
  //   TodoApi.getList(workspaceId).then((data) => {
  //     console.log("data : ", data);
  //     setTodoItem(data);
  //   });
  // }, [workspaceId]);

  // useEffect(() => {
  //   TodoApi.getAllList(workspaceId).then((data) => {
  //     setTodoLeaderItem(data);
  //   });
  // }, [workspaceId])

  const fetchData = async () => {
    let data;
    if (role === "LEADER" || role === "SUB_LEADER") {
      data = await TodoApi.getAllList(workspaceId);
    } else {
      data = await TodoApi.getList(workspaceId);
    }
    setTodoItem(data);
  };
  useEffect(() => {
    fetchData();
  }, [workspaceId, role]);

  return (
    <div className="todo_item_container">
      {todoItem.map((todo) => (
        <div key={todo.id} className="todo_item_contents">
          <TodoItem todo={todo} />
        </div>
      ))}
    </div>
  );
};

export default TodoComponent;
