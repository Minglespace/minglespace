import React, { useState } from "react";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";
import { useContext } from "react";
import TodoModal from "./TodoModal";
const TodoItem = ({ todo }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [ modifyTodo, setModifyTodo] = useState({todo});
  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSave = (updatedTodo) => {
    setModifyTodo(modifyTodo.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo))
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  return (
    <div onClick={(e) => {e.stopPropagation(); handleModalOpen();}}>
      <div>
        <div>
          <p className="todo_item_title">{todo.title}</p>
          <p className="todo_item_content">{todo.content}</p>
          <div className="todo_item_date">
            <p>{formatDate(todo.start_date)}　~　</p>
            <p>{formatDate(todo.end_date)} 까지</p>
          </div>
          <div className="todo_createor_assignee">
            <p className="todo_item_creator">담당자 : {todo.creator_name}</p>
            <p className="todo_item_asignee">
              작업자 :{" "}
              {todo.assignee_list.map((assignee) => (
                <>
                  <span key={assignee.id}>{assignee.name} </span>
                  <br></br>
                </>
              ))}
            </p>
          </div>
          {/* <p>role:{role}</p> */}
        </div>
      </div>

      <TodoModal todo={todo} open={modalOpen} onClose={handleModalClose} onSave={handleSave}/>
    </div>
  );
};

export default TodoItem;
