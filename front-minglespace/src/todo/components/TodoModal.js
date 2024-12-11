import React, {useState} from "react";
import Modal from "../../common/Layouts/components/Modal";
import TodoApi from "../../api/TodoApi";

const TodoModal = ({ open, onClose, todo, onSave }) => {
  const [title, setTitle] = useState(todo.title);
  const [content, setContent] = useState(todo.content); 
  const [startDate, setStartDate] = useState(new Date(todo.start_date)); 
  const [endDate, setEndDate] = useState(new Date(todo.end_date)); 
  const [assignee, setAssignee] = useState(todo.assignee_list[0].name);

  const handleSave = async () => {
     const updatedTodo = {
       ...todo, 
       title, 
       content, 
       start_date: startDate, 
       end_date: endDate, 
       assignee_list: [{
         id: todo.assignee_list[0].id, 
         name: assignee 
        }], };

        const result = await TodoApi.modifyTodo(todo.id, todo.workspace_id, updatedTodo);
        onSave(result); 
        onClose();
      };
  if (!open) return null;

  return (
    <div> 
      <Modal open={open} onClose={onClose}> 
      <div> 
        <h2>Edit Todo</h2> 
        <label> Title: 
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /> 
        </label> <br />
        <label> Content:
          <input type="text" value={content} onChange={(e) => setContent(e.target.value)} /> 
        </label> <br />
        <label> Start Date:
          <input type="date" value={startDate.toISOString().split('T')[0]} onChange={(e) => setStartDate(new Date(e.target.value))} /> 
        </label> <br />
        <label> End Date:
          <input type="date" value={endDate.toISOString().split('T')[0]} onChange={(e) => setEndDate(new Date(e.target.value))} /> 
        </label> <br />
        <label> Assignee:
          <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} /> 
        </label> <br />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button> 
      </div>
      </Modal> 
    </div>
  );
};

export default TodoModal;
