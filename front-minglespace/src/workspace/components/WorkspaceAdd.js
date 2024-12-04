import React, { useEffect, useState } from "react";
import Button from "../../common/Layouts/components/Button";
import Modal from "../../common/Layouts/components/Modal"; // Modal 컴포넌트 임포트

import WorkspaceApi from "../../api/workspaceApi";

import { useNavigate } from "react-router-dom";

const initState = {
  name: "",
  wsdesc: "",
};
const userId = "1";

const WorkspaceAdd = ({
  open,
  onClose,
  onAddWorkspace,
  onUpdateWorkspace,
  editingWorkspace,
}) => {
  const [newWorkspace, setNewWorkspace] = useState({ ...initState });

  useEffect(() => {
    if (editingWorkspace) {
      setNewWorkspace(editingWorkspace);
    } else {
      setNewWorkspace({ ...initState });
    }
  }, [editingWorkspace]);

  const handleChangeNewWorkspace = (e) => {
    newWorkspace[e.target.name] = e.target.value;
    setNewWorkspace({ ...newWorkspace });
  };

  const handleClickAdd = () => {
    if (editingWorkspace) {
      onUpdateWorkspace(newWorkspace);
    } else {
      WorkspaceApi.postAdd(userId, newWorkspace).then((result) => {
        setNewWorkspace({ ...initState });
        onAddWorkspace(result);
        onClose();
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="workspace_add_modal_container">
        <h1>Create Workspace</h1>
        <p className="input_label1">WorkSpace Name</p>
        <input
          className="workspace_name_input"
          name="name"
          type={"text"}
          value={newWorkspace.name}
          onChange={handleChangeNewWorkspace}
          placeholder="워크스페이스 제목을 기입하세요"
        />
        <p className="input_label2">WorkSpace Description</p>
        <textarea
          className="workspace_desc_input"
          name="wsdesc"
          value={newWorkspace.wsdesc}
          onChange={handleChangeNewWorkspace}
          placeholder="워크스페이스 설명을 기입하세요"
        />
        <div className="workspace_button_container">
          <button className="cancle_button" onClick={onClose}>
            취소
          </button>
          <button className="add_button" onClick={handleClickAdd}>
            추가
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WorkspaceAdd;
