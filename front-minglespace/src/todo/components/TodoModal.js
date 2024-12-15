import React, { useState, useEffect } from "react";
import Modal from "../../common/Layouts/components/Modal";
import { useParams } from "react-router-dom";
import MembersApi from "../../api/membersApi";
import Userinfo from "../../common/Layouts/components/Userinfo";

const initTodo = {
  title: "",
  content: "",
  start_date: Date.now(),
  end_date: Date.now(),
  wsMember_id: [], // 필드 이름 수정
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
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (editingTodo) {
      const wsMemberIdArray = editingTodo.assignee_list
        ? editingTodo.assignee_list.map((member) => member.memberId)
        : [];
      setNewTodo({ ...editingTodo, wsMember_id: wsMemberIdArray });
    } else {
      setNewTodo({ ...initTodo });
    }
  }, [editingTodo]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersList = await MembersApi.getMemberList(workspaceId);
        setMembers(membersList);
      } catch (error) {
        console.error("Failed", error);
      }
    };
    fetchMembers();
  }, [workspaceId]);

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
    const { value, checked } = e.target;
    const wsMemberId = parseInt(value, 10);
    if (checked) {
      setNewTodo((prevTodo) => ({
        ...prevTodo,
        wsMember_id: [...prevTodo.wsMember_id, wsMemberId],
      }));
    } else {
      setNewTodo((prevTodo) => ({
        ...prevTodo,
        wsMember_id: prevTodo.wsMember_id.filter((id) => id !== wsMemberId),
      }));
    }
  };

  const handleClickAdd = () => {
    if (editingTodo) {
      onModify(newTodo);
      onRendering(false);
    } else {
      onAdd(newTodo);
      onRendering(false);
    }
  };

  return (
    <div>
      <Modal open={open} onClose={onClose}>
        <div className="todo_modal_container">
          <h2 className="todo_modal_main_title">
            {editingTodo
              ? role === "LEADER" || role === "SUB_LEADER"
                ? "Edit Todo"
                : "View Todo"
              : "Add Todo"}
          </h2>
          <div className="todo_modal_flexarea">
            <span className="todo_modal_title">제목 : </span>
            {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
              <p className="todo_modal_title_p">{newTodo.title}</p>
            ) : (
              <input
                className="todo_modal_title_input"
                name="title"
                type="text"
                value={newTodo.title}
                onChange={handleChangeNewTodo}
                readOnly={
                  editingTodo && role !== "LEADER" && role !== "SUB_LEADER"
                }
              />
            )}
            <br /> <span className="todo_modal_content">내용 : </span>
            {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
              <p className="todo_modal_content_p">{newTodo.content}</p>
            ) : (
              <input
                className="todo_modal_content_input"
                name="content"
                type="text"
                value={newTodo.content}
                onChange={handleChangeNewTodo}
                readOnly={
                  editingTodo && role !== "LEADER" && role !== "SUB_LEADER"
                }
              />
            )}
            <br /> <span>시작일자 : </span>
            {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
              <p>{new Date(newTodo.start_date).toISOString().split("T")[0]}</p>
            ) : (
              <input
                name="start_date"
                type="date"
                value={new Date(newTodo.start_date).toISOString().split("T")[0]}
                onChange={handleChangeNewTodo}
                readOnly={
                  editingTodo && role !== "LEADER" && role !== "SUB_LEADER"
                }
              />
            )}
            <br /> <span>종료일자 : </span>
            {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
              <p>{new Date(newTodo.end_date).toISOString().split("T")[0]}</p>
            ) : (
              <input
                name="end_date"
                type="date"
                value={new Date(newTodo.end_date).toISOString().split("T")[0]}
                onChange={handleChangeNewTodo}
                readOnly={
                  editingTodo && role !== "LEADER" && role !== "SUB_LEADER"
                }
              />
            )}
            <br /> <span>작업대상</span>
            {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
              <p>{newTodo.wsMember_id.join(", ")}</p>
            ) : (
              <div className="assignee_list">
                {members.map((member) => (
                  <div key={member.wsMemberId} className="userinfo_item">
                    <Userinfo
                      name={member.name}
                      role={member.role}
                      email={member.email}
                      src={member.imageUriPath}
                    />
                    <input
                      type="checkbox"
                      value={member.wsMemberId}
                      checked={
                        newTodo.wsMember_id &&
                        newTodo.wsMember_id.includes(member.wsMemberId)
                      }
                      onChange={handleWsMemberIdsChange}
                      className="userinfo_checkbox"
                    />
                  </div>
                ))}
              </div>
            )}
            <br />
          </div>
          <div className="todo_modal_button_area">
            {(role === "LEADER" || role === "SUB_LEADER") && (
              <button className="add_button_2" onClick={handleClickAdd}>
                Save
              </button>
            )}
            <button className="cancle_button" onClick={onClose}>
              Cancel
            </button>
            {(role === "LEADER" || role === "SUB_LEADER") && (
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
