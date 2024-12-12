import React, { useContext } from "react";
import { useEffect, useState } from "react";
import TodoApi from "../../api/TodoApi";
import { useParams } from "react-router-dom";
import TodoItem from "./TodoItem";
import TodoModal from "./TodoModal";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";

const TodoComponent = () => {
  const [todoItem, setTodoItem] = useState([]);
  const { workspaceId } = useParams("workspaceId");
  const {
    wsMemberData: { role },
  } = useContext(WSMemberRoleContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [rendering, setRendering] = useState(false);

  const fetchData = async () => {
    let data;
    if (role === "LEADER" || role === "SUB_LEADER") {
      data = await TodoApi.getAllList(workspaceId);
    } else {
      data = await TodoApi.getList(workspaceId);
    }
    setTodoItem(data);
    setRendering(false);
  };

  const handleRendering = () => {
    setRendering(true);
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId, role, rendering]);

  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAddTodo = (newTodo) => {
    TodoApi.postAddTodo(workspaceId, newTodo).then((addedTodo) => {
      setTodoItem((prevTodo) => [...prevTodo, newTodo]);
      setModalOpen(false);
      handleRendering();
    });
  };

  const handleDeleteTodo = (id) => {
    setTodoItem((prevTodoItems) =>
      prevTodoItems.filter((todo) => todo.id !== id)
    );
    setModalOpen(false);
  };

  return (
    <div className="todo_item_container">
      <div className="todo_item_add_button_section">
        <button className="todo_item_add_button" onClick={handleModalOpen}>
          할일 추가
        </button>
      </div>
      {todoItem.map((todo) => (
        <div key={todo.id} className="todo_item_contents">
          <TodoItem
            todo={todo}
            onDelete={handleDeleteTodo}
            onRendering={handleRendering}
            role={role}
          />
        </div>
      ))}
      {modalOpen && (
        <TodoModal
          open={modalOpen}
          onClose={handleModalClose}
          onAdd={handleAddTodo}
          onRendering={handleRendering}
          role={role}
        />
      )}
    </div>
  );
};

export default TodoComponent;
