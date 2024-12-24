import React, { useEffect, useRef, useState } from "react";
import Modal from "../../common/Layouts/components/Modal"; // Modal 컴포넌트 임포트
import WorkspaceApi from "../../api/workspaceApi";
import { getErrorMessage } from "../../common/Exception/errorUtils";
import { useParams } from "react-router-dom";

const initState = {
  id: "",
  name: "",
  wsdesc: "",
  conunt: "",
};

const WorkspaceModify = ({
  open,
  onClose,
  onModifyWorkspace,
  workspaceData,
}) => {
  const { workspaceId } = useParams();
  const [updateWorkspace, setUpdateWorkspace] = useState({ ...initState });
  const focusName = useRef(null);
  const focusWsdesc = useRef(null);

  useEffect(() => {
    setUpdateWorkspace(workspaceData);
  }, [workspaceData]);

  const handleChangeNewWorkspace = (e) => {
    const { name, value } = e.target;
    setUpdateWorkspace((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //워크스페이스 수정
  const workspaceModify = async () => {
    try {
      const result = await WorkspaceApi.modifyOne(workspaceId, updateWorkspace);
      setUpdateWorkspace(result);
    } catch (error) {
      alert(
        `워크스페이스 수정 중 에러가 발생했습니다\n원인:${getErrorMessage(
          error
        )}`
      );
    }
  };

  const handleClickModify = () => {
    if (updateWorkspace.name === null || updateWorkspace.name === "") {
      alert("워크스페이스 제목을 입력해 주세요.");
      focusName.current.focus();
      return false;
    } else if (
      updateWorkspace.wsdesc === null ||
      updateWorkspace.wsdesc === ""
    ) {
      alert("워크스페이스 설명을 입력해 주세요.");
      focusWsdesc.current.focus();
      return false;
    }

    workspaceModify();
    alert("워크스페이스 수정에 성공하였습니다.");
    onModifyWorkspace(updateWorkspace);
    onClose();
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
          value={updateWorkspace.name}
          onChange={handleChangeNewWorkspace}
          placeholder="워크스페이스 제목을 기입하세요"
        />
        <p className="input_label2">WorkSpace Description</p>
        <input
          ref={focusWsdesc}
          className="workspace_desc_input"
          name="wsdesc"
          value={updateWorkspace.wsdesc}
          onChange={handleChangeNewWorkspace}
          placeholder="워크스페이스 설명을 기입하세요"
        />
        <div className="workspace_button_container">
          <button className="cancle_button" onClick={onClose}>
            취소
          </button>
          <button className="add_button" onClick={handleClickModify}>
            수정
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WorkspaceModify;
