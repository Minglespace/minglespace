import React, { useState, useEffect } from "react";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";
import TodoModal from "./TodoModal";
import TodoApi from "../../api/TodoApi";
import { useParams } from "react-router-dom";
const TodoItem = React.memo(
  ({
    todo,
    onDelete,
    onRendering,
    role,
    members,
    onModify,
    isValidCharacter,
  }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modifyTodo, setModifyTodo] = useState([]);
    const [localTodo, setLocalTodo] = useState(todo);
    const [editingTodo, setEditingTodo] = useState(null);
    const { workspaceId } = useParams("workspaceId");

    useEffect(() => {
      setLocalTodo(todo);
    }, [todo]);

    //모달 On
    const handleModalOpen = () => {
      setModalOpen(true);
    };
    //모달 Off
    const handleModalClose = () => {
      setModalOpen(false);
      setEditingTodo(null);
    };
    //add버튼을 누르면 빈 Modal표시
    const handleAddTodo = (newTodo) => {
      setModifyTodo((prevTodo) => [...prevTodo, newTodo]);
      setLocalTodo(newTodo);
      onRendering(false);
    };
    //수정버튼 누르면 현제 데이터를 가진 Modal 표시
    const handleEditTodo = () => {
      setEditingTodo(todo);
      setModalOpen(true);
      onRendering(false);
    };

    //Todo 수정을 위한 데이터 업데이트
    const handleModifyTodo = (updatedTodo) => {
      onModify(updatedTodo);
      setModalOpen(false);
    };

    //Todo 삭제
    const handleDeleteTodo = (workspaceId, todoId) => {
      const id = todoId.id || todoId;
      TodoApi.deleteTodo(workspaceId, id).then(() => {
        onDelete(id);
        setModalOpen(false);
      });
    };
    //날짜 Format 변경
    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    };

    return (
      <div key={todo.id} onClick={() => handleEditTodo(todo.id)}>
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
              작업자 :
              {Array.isArray(todo.assignee_list) &&
              todo.assignee_list.length > 0 ? (
                <span>
                  {" "}
                  {todo.assignee_list[0].name} 등 {todo.assignee_list.length}명
                </span>
              ) : (
                <></>
              )}
            </p>
          </div>
        </div>

        <TodoModal
          role={role}
          todo={todo}
          open={modalOpen}
          members={members}
          onClose={handleModalClose}
          onAdd={handleAddTodo}
          onModify={handleModifyTodo}
          editingTodo={editingTodo}
          onEdit={handleEditTodo}
          onDelete={(todoId) => handleDeleteTodo(workspaceId, todo)}
          isValidCharacter={isValidCharacter}
          onRendering={onRendering}
        />
      </div>
    );
  }
);

export default TodoItem;
