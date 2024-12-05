import React, { useEffect, useState } from "react";
import WorkspaceItem from "./components/WorkspaceItem";
import { useNavigate } from "react-router-dom";

import WorkspaceApi from "../api/workspaceApi";

import WorkspaceAdd from "./components/WorkspaceAdd";
import { FaPlus } from "react-icons/fa6";

const Workspace = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceData, setWorkspaceData] = useState([]);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  //userId를 기준으로 워크스페이스 정보의 상태를 담을 useState
  const navigate = useNavigate();
  //onClick으로 상세보기 페이지 이동을 위한 navigate 지정

  useEffect(() => {
    WorkspaceApi.getList().then((data) => {
      setWorkspaceData(data); //useState 상태에 저장
    });
  }, []);

  // useEffect(() => {

  // }, [workspaceData])

  const moveToRead = (workspace) => {
    //클릭 시 worspaceId를 매개변수로 받음
    navigate(`/workspace/${workspace.id}`, {
      //경로 지정(임시로 workspace/아이디)
      state: {
        id: workspace.id,
        name: workspace.name,
        count: workspace.count,
        wsdesc: workspace.wsdesc,
        //workspace id로 params를 조회할 때 state로 workspace의 정보를 같이 보냄
      },
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddWorkspace = (newWorkspace) => {
    setWorkspaceData((prevData) => [...prevData, newWorkspace]);
  };

  const handleEditWorkspace = (id) => {
    const workspaceToEdit = workspaceData.find(
      (workspace) => workspace.id === id
    );
    setEditingWorkspace(workspaceToEdit);
    setIsModalOpen(true);
  };

  const handleUpdateWorkspace = (updatedWorkspace) => {
    WorkspaceApi.modifyOne(updatedWorkspace.id, updatedWorkspace)
      .then((result) => {
        setWorkspaceData((prevData) =>
          prevData.map((workspace) =>
            workspace.id === result.id
              ? { ...result, count: updatedWorkspace.count }
              : workspace
          )
        );
        setIsModalOpen(false);
        setEditingWorkspace(null);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleDeleteWorkspace = (workspaceId) => {
    WorkspaceApi.deleteOne(workspaceId).then(() => {
      setWorkspaceData((prevData) =>
        prevData.filter((workspace) => workspace.id !== workspaceId)
      );
    });
  };

  return (
    <div>
      <div className="create_workspace">
        <div onClick={handleOpenModal} className="create_icon">
          <p>
            <FaPlus />
          </p>
          {/* <img className="create_img" alt="" src="/profile1.png" /> */}
        </div>
        <h1 className="create_txt">
          새로운 워크스페이스를 개설하고 팀원들을 초대하여 협업해 보세요
        </h1>
      </div>
      <div className="workspace_list_container">
        {workspaceData.map((workspace) => (
          // 가지고 있는 data 갯수만큼 반복하여 워크스페이스 목록을 생성
          <WorkspaceItem
            key={workspace.id}
            id={workspace.id}
            name={workspace.name}
            count={workspace.count}
            wsdesc={workspace.wsdesc}
            onClick={() => moveToRead(workspace)}
            // 클릭 시 현재 id정보를 매개변수로 url을 지정하여 이동함
            // WorkspaceItem은 워크스페이스에 대한 모든 정보를 props로 가지도록 함
            onDelete={() => handleDeleteWorkspace(workspace.id)}
            onEdit={handleEditWorkspace}
          />
        ))}
      </div>
      <WorkspaceAdd
        open={isModalOpen}
        onClose={handleCloseModal}
        onAddWorkspace={handleAddWorkspace}
        onUpdateWorkspace={handleUpdateWorkspace}
        editingWorkspace={editingWorkspace}
      />
    </div>
  );
};

export default Workspace;
