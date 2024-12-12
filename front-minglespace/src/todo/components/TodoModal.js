import React, { useState, useEffect } from "react";
import Modal from "../../common/Layouts/components/Modal";
import { useParams } from "react-router-dom";

const initTodo = {
  title: "",
  content: "",
  start_date: Date.now(),
  end_date: Date.now(),
  wsMember_id: "", // 필드 이름 수정
};

const TodoModal = ({
  open,
  onClose,
  todo,
  onAdd,
  onModify,
  editingTodo,
  onDelete,
  onRendering,
  role,
}) => {
  const [newTodo, setNewTodo] = useState({ ...initTodo });
  const { workspaceId } = useParams("workspaceId");

  useEffect(() => {
    if (editingTodo) {
      const assigneeString = editingTodo.wsMember_id
        ? editingTodo.wsMember_id.join(", ")
        : "";
      setNewTodo({ ...editingTodo, wsMember_id: assigneeString });
    } else {
      setNewTodo({ ...initTodo });
    }
  }, [editingTodo]);

  const handleChangeNewTodo = (e) => {
    const { name, value } = e.target;

    if (name === "start_date" || name === "end_date") {
      newTodo[name] = new Date(value).getTime();
    } else {
      newTodo[name] = value;
    }
    setNewTodo({ ...newTodo });
  };

  const handleWsMemberIdsChange = (e) => {
    const value = e.target.value;
    setNewTodo({ ...newTodo, wsMember_id: value });
  };

  const handleClickAdd = () => {
    const updatedTodo = {
      ...newTodo,
      wsMember_id: newTodo.wsMember_id
        .split(",")
        .map((id) => parseInt(id.trim())),
    };

    if (editingTodo) {
      onModify(updatedTodo);
      onRendering(false);
    } else {
      onAdd(updatedTodo);
      onRendering(false);
    }
  };

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <div className="todo_modal_container">
          <h2 className="todo_modal_main_title">
            {editingTodo ? "Edit Todo" : "Add Todo"}
          </h2>
          <div className="todo_modal_flexarea">
            <span className="todo_modal_title">제목 : </span>
            <input
              className="todo_modal_title_input"
              name="title"
              type="text"
              value={newTodo.title}
              onChange={handleChangeNewTodo}
            />

            <br />
            <span className="todo_modal_content">내용 : </span>
            <input
              className="todo_modal_content_input"
              name="content"
              type="text"
              value={newTodo.content}
              onChange={handleChangeNewTodo}
            />

            <br />
            <span>시작일자 : </span>
            <input
              name="start_date"
              type="date"
              value={new Date(newTodo.start_date).toISOString().split("T")[0]}
              onChange={handleChangeNewTodo}
            />

            <br />
            <span>종료일자 : </span>
            <input
              name="end_date"
              type="date"
              value={new Date(newTodo.end_date).toISOString().split("T")[0]}
              onChange={handleChangeNewTodo}
            />

            <br />
            <span>작업대상 : </span>
            <input
              name="wsMember_id"
              type="text"
              value={newTodo.wsMember_id}
              onChange={handleWsMemberIdsChange}
            />

            <br />
          </div>
          <div className="todo_modal_button_area">
            <button className="add_button_2" onClick={handleClickAdd}>
              Save
            </button>
            <button className="cancle_button" onClick={onClose}>
              Cancel
            </button>
            {editingTodo && (
              <button className="exit_button" onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TodoModal;
