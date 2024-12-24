import React, { useEffect, useRef, useState } from "react";
import Modal from "../../common/Layouts/components/Modal"; // Modal 컴포넌트 임포트
import WorkspaceApi from "../../api/workspaceApi";
import { getErrorMessage } from "../../common/Exception/errorUtils";
const initState = {
  name: "",
  wsdesc: "",
};

const WorkspaceAdd = ({ open, onClose, onAddWorkspace, editingWorkspace }) => {
  const [newWorkspace, setNewWorkspace] = useState({ ...initState });
  const focusName = useRef(null);
  const focusWsdesc = useRef(null);

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
    if (newWorkspace.name === null || newWorkspace.name === "") {
      alert("워크스페이스 제목을 입력해 주세요.");
      focusName.current.focus();
      return false;
    } else if (newWorkspace.wsdesc === null || newWorkspace.wsdesc === "") {
      alert("워크스페이스 설명을 입력해 주세요.");
      focusWsdesc.current.focus();
      return false;
    }

    WorkspaceApi.postAdd(newWorkspace)
      .then((result) => {
        setNewWorkspace({ ...initState });
        onAddWorkspace(result);
        onClose();
      })
      .catch((error) =>
        alert(
          `워크스페이스 추가 중 에러가 발생했습니다 \n원인:${getErrorMessage(
            error
          )}`
        )
      );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="workspace_add_modal_container">
        <h1>Create Workspace</h1>
        <p className="input_label1">WorkSpace Name</p>
        <input
          ref={focusName}
          className="workspace_name_input"
          name="name"
          type={"text"}
          maxLength={20}
          value={newWorkspace.name}
          onChange={handleChangeNewWorkspace}
          placeholder="워크스페이스 제목을 기입하세요"
        />
        <p className="input_label2">WorkSpace Description</p>
        <input
          ref={focusWsdesc}
          type="text"
          maxLength={40}
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
