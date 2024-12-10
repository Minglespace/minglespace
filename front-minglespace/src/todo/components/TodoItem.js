import React, { useState } from "react";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";
import { useContext } from "react";
import TodoModal from "./TodoModal";
const TodoItem = ({
  id,
  title,
  content,
  start_date,
  end_date,
  creator_id,
  complete,
}) => {
  const { memberId, role } = useContext(WSMemberRoleContext);
  // console.log("id : ", memberId);
  // console.log("role : ", role);
  // console.log("complete : ", complete);
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  return (
    <div key={id} className="todo_item_contents" onClick={handleModalOpen}>
      <div className={`${complete ? "_completed" : "_uncompleted"}`}>
        <div>
          <p className="todo_item_title">{title}</p>
          <p className="todo_item_content">{content}</p>
          <div className="todo_item_date">
            <p>{formatDate(start_date)}　~　</p>
            <p>{formatDate(end_date)} 까지</p>
          </div>
          <div className="todo_createor_assignee">
            <p className="todo_item_creator">담당자 : {creator_id}</p>
            <p className="todo_item_asignee">작업자 : {memberId}</p>
          </div>
          {/* <p>role:{role}</p> */}
        </div>
      </div>

      <TodoModal open={modalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default TodoItem;
