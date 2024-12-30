import React, { useState, useEffect, useRef } from "react";
import Modal from "../../common/Layouts/components/Modal";
import { useParams } from "react-router-dom";
import MembersApi from "../../api/membersApi";
import Userinfo from "../../common/Layouts/components/Userinfo";
import { formatDateToKST } from "../../common/DateFormat/dateUtils";

const initTodo = {
  title: "",
  content: "",
  start_date: formatDateToKST(Date.now()),
  end_date: formatDateToKST(Date.now()),
  wsMember_id: [], // 필드 이름 수정
};

const TodoModal = React.memo(
  ({
    open,
    onClose,
    onAdd,
    onModify,
    editingTodo,
    onDelete,
    onRendering,
    role,
    members,
    isValidCharacter,
  }) => {
    const [newTodo, setNewTodo] = useState({ ...initTodo });
    const { workspaceId } = useParams("workspaceId");
    const titleRef = useRef(null);
    const contentRef = useRef(null);
    const [complete, setComplete] = useState(false);

    useEffect(() => {
      if (editingTodo) {
        const wsMemberIdArray = editingTodo.assignee_list
          ? editingTodo.assignee_list.map((member) => member.memberId)
          : [];
        setNewTodo({ ...editingTodo, wsMember_id: wsMemberIdArray });
        console.log(editingTodo.complete);
        setComplete(editingTodo.complete);
      } else {
        setNewTodo({ ...initTodo });
      }
    }, [editingTodo]);

    const handleComplete = (e) => {
      if (e.target.value === "true") {
        setNewTodo({ ...newTodo, complete: false });
        setComplete(false);
      } else {
        setNewTodo({ ...newTodo, complete: true });
        setComplete(true);
      }
      console.log(newTodo);
    };

    const handleChangeNewTodo = (e) => {
      const { name, value } = e.target;
      if (name === "start_date" || name === "end_date") {
        newTodo[name] = formatDateToKST(value);
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
      if (
        !isValidCharacter(newTodo.title) ||
        !isValidCharacter(newTodo.content)
      ) {
        alert("특수문자만 입력하실수는 없습니다.");
        return false;
      } else if (!newTodo.title.trim()) {
        alert("제목을 입력해 주세요.");
        titleRef.current.focus();
        return;
      } else if (!newTodo.content.trim()) {
        alert("내용을 입력해 주세요.");
        contentRef.current.focus();
        return;
      } else if (newTodo.wsMember_id.length === 0) {
        alert("작업자를 한명이상 선택해 주세요.");
        return;
      } else if (newTodo.start_date > newTodo.end_date) {
        alert("종료일이 시작일보다 먼저일수 없습니다.");
        setNewTodo((prevTodo) => ({
          ...prevTodo,
          end_date: prevTodo.start_date,
        }));
        return;
      }

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
                  maxLength={15}
                  ref={titleRef}
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
                  maxLength={30}
                  className="todo_modal_content_input"
                  name="content"
                  type="text"
                  ref={contentRef}
                  value={newTodo.content}
                  onChange={handleChangeNewTodo}
                  readOnly={
                    editingTodo && role !== "LEADER" && role !== "SUB_LEADER"
                  }
                />
              )}
              <br /> <span>시작일 : </span>
              {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
                <p>{formatDateToKST(newTodo.start_date).split("T")[0]}</p>
              ) : (
                <input
                  name="start_date"
                  type="date"
                  value={formatDateToKST(newTodo.start_date).split("T")[0]}
                  onChange={handleChangeNewTodo}
                  readOnly={
                    editingTodo && role !== "LEADER" && role !== "SUB_LEADER"
                  }
                />
              )}
              <br /> <span>마감일 : </span>
              {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
                <p>{formatDateToKST(newTodo.end_date).split("T")[0]}</p>
              ) : (
                <input
                  name="end_date"
                  type="date"
                  value={formatDateToKST(newTodo.end_date).split("T")[0]}
                  onChange={handleChangeNewTodo}
                  readOnly={
                    editingTodo && role !== "LEADER" && role !== "SUB_LEADER"
                  }
                />
              )}
              <br />
              <span>담당자</span>
              {editingTodo && role !== "LEADER" && role !== "SUB_LEADER" ? (
                <div className="assignee_list">
                  {editingTodo.assignee_list.map((assignee, index) => (
                    <div
                      key={`${assignee.wsMemberId}-${index}`}
                      className="userinfo_item_show"
                    >
                      <Userinfo
                        name={assignee.name}
                        role={assignee.role}
                        email={assignee.email}
                        src={assignee.imageUriPath}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="assignee_list">
                  {members.map((member, index) => (
                    <div
                      key={`${member.wsMemberId}-${index}`}
                      className="userinfo_item"
                    >
                      <Userinfo
                        name={member.name}
                        role={member.role}
                        email={member.email}
                        src={member.imageUriPath}
                      />
                      <input
                        name="assignees"
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
              <div>
                <label>완료여부 : </label>
                <input
                  type="checkbox"
                  value={complete}
                  checked={complete}
                  onChange={handleComplete}
                />
              </div>
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
              {editingTodo && (role === "LEADER" || role === "SUB_LEADER") ? (
                <button className="exit_button" onClick={onDelete}>
                  Delete
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </Modal>
      </div>
    );
  }
);

export default TodoModal;
