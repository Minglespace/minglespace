import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import UserInfoPopup from "../../../auth/UserInfoPopup";
import { FaPenToSquare } from "react-icons/fa6";
import {
  getErrorStatus,
  getErrorMessage,
} from "../../../common/Exception/errorUtils";
import WorkspaceApi from "../../../api/workspaceApi";
import { WSMemberRoleContext } from "../../../workspace/context/WSMemberRoleContext";
import WorkspaceModify from "../../../workspace/components/WorkspaceModify";
import NotificationIcon from "../../../notification/NotificationIcon";
import { NotificationProvider } from "../../../notification/context/NotificationContext";
import Modal from "../components/Modal";
import Confirm from "../components/Confirm";

const initData = {
  id: "",
  name: "Mingle Space에 오신것을 환영합니다.",
  wsdesc: "",
  count: "",
};

const Header = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspaceData, setWorkspaceData] = useState({ ...initData });
  //토글 수정삭제메뉴 설정
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  //워크스페이스 수정을위한 모달,편집
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    wsMemberData: { role },
  } = useContext(WSMemberRoleContext);

  //워크스페이스 내용조회
  const getWorkspaceData = async () => {
    try {
      const workspaceData = await WorkspaceApi.getOne(workspaceId);
      setWorkspaceData(workspaceData);
    } catch (error) {
      if (getErrorStatus(error) === 403 || getErrorStatus(error) === 400) {
        navigate("/workspace");
        alert(
          `워크스페이스 정보조회에 실패하였습니다.\n${getErrorMessage(error)}`
        );
      } else {
        alert(
          `워크스페이스 정보조회에 실패하였습니다.\n원인:${getErrorMessage(
            error
          )}`
        );
        setWorkspaceData((prevData) => ({
          ...prevData,
          name: "워크스페이스 정보조회 실패",
        }));
      }
    }
  };

  useEffect(() => {
    if (workspaceId) getWorkspaceData();
  }, [workspaceId]);

  //워크스페이스 삭제
  const deleteWorkspace = async () => {
    try {
      const result = await WorkspaceApi.deleteOne(workspaceId);
      setWorkspaceData((prevData) =>
        prevData.filter((workspace) => workspace.id !== workspaceId)
      );
      navigate("/workspace");
      alert(`삭제 성공: ${JSON.stringify(result)}`);
    } catch (error) {
      alert(
        `워크스페이스 삭제 중 에러가 발생했습니다.\n원인 : ${getErrorMessage(
          error
        )}`
      );
    }
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    deleteWorkspace();
    setMenuOpen(false);
    setConfirmModalOpen(false);
  };
  //수정시 상태업데이트 위한코드
  const handleModifyWorkspace = (newWorkspace) => {
    setWorkspaceData(newWorkspace);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setConfirmModalOpen(false);
  };
  const handleOpenCofirmModal = () => {
    setConfirmModalOpen(true);
  };

  return (
    <header>
      {/* <h1>Mingle Space에 오신것을 환영합니다.</h1> */}
      <Link to="/">
        <img className="logo_icon" src="/minglespace_logo.png" alt="" />
      </Link>
      <div className={workspaceData.id ? "title_and_icon" : ""}>
        <h1 className={workspaceData.id ? "title left_align" : "title"}>
          {workspaceData.name}
        </h1>
        {role === "LEADER" ? (
          <div className="menu_container">
            <FaPenToSquare className="menu_icon" onClick={handleMenuToggle} />
            {menuOpen && (
              <div
                className="menu_dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="menu_item" onClick={handleOpenModal}>
                  수정
                </p>
                <p className="menu_item" onClick={handleOpenCofirmModal}>
                  삭제
                </p>
              </div>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>

      <div
        className="button-container"
        style={{ display: "flex", alignItems: "center" }}
      >
        <NotificationProvider>
          <NotificationIcon />
        </NotificationProvider>
        <UserInfoPopup />
      </div>

      <WorkspaceModify
        open={isModalOpen}
        onClose={handleCloseModal}
        onModifyWorkspace={handleModifyWorkspace}
        workspaceData={workspaceData}
      />
      <Modal open={confirmModalOpen} onClose={handleCloseModal}>
        <Confirm onClose={handleCloseModal} onDelete={handleDeleteClick} />
      </Modal>
    </header>
  );
};

export default Header;
