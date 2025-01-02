import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./section/SideBar";
import Footer from "./section/Footer";
import Header from "./section/Header";
import { useNavigate, useParams } from "react-router-dom";

import WorkspaceApi from "../../api/workspaceApi";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";
import { getErrorMessage, getErrorStatus } from "../Exception/errorUtils";
import api from "../../api/Api";
import Modal from "./components/Modal";
import Repo from "../../auth/Repo";
import ModalMessage from "./components/ModalMessage";

const BasicLayout = ({ children }) => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [wsMemberData, setWsMEmberData] = useState({ memberId: "", role: "" });
  const getWsMemberRole = useCallback(async () => {
    try {
      const wsMemberRoleData = await WorkspaceApi.getWsMemberRole(workspaceId);
      setWsMEmberData(wsMemberRoleData);
    } catch (error) {
      if (getErrorStatus(error) === 403 || getErrorStatus(error) === 400) {
        navigate("/workspace");
        alert(`권한 조회에 실패하였습니다.\n원인:${getErrorMessage(error)}`);
      } else {
        alert(`권한 조회에 실패하였습니다.\n원인:${getErrorMessage(error)}`);
      }
    }
  }, [workspaceId, navigate]);

  useEffect(() => {
    api.setOnCallback_RefreshTokenExpired(handleRefreshTokenExpired);
    api.setOnCallback_WithdrawalAble(handleWithdrawalAble);

    if (workspaceId) {
      getWsMemberRole();
    }

    return () => {
      api.setOnCallback_RefreshTokenExpired(null);
      api.setOnCallback_WithdrawalAble(null);
    };
  }, [workspaceId, getWsMemberRole]);

  const refreshMemberContext = useCallback(() => {
    getWsMemberRole();
  }, [getWsMemberRole]);

  // 토큰만료 관련 콜백 함수
  const handleRefreshTokenExpired = (msStatus) => {
    console.log("handleRefreshTokenExpired, msStatus : ", msStatus);
    setMessage({
      title: "확인",
      content: "로그인 인증이 만료되었습니다. 다시 로그인 하세요.",
      callbackOk: () => {
        Repo.clearItem();
        setMessage(null);
        navigate("/auth/login");
      },
    });
  };

  // 회원탈퇴 관련 콜백 함수
  const handleWithdrawalAble = (msStatus) => {
    console.log("handleWithdrawalAble, msStatus : ", msStatus);
    navigate("/auth/withdrawal");
  };

  return (
    <>
      <WSMemberRoleContext.Provider
        value={{ wsMemberData, refreshMemberContext }}
      >
        <Header />
        <div className="midcontainer">
          <Sidebar />
          <div className="main_container">

            {/* 모달 팝업 */}
            <ModalMessage message={message} />

            {/* 페이지들 */}
            {children}
          </div>
        </div>
      </WSMemberRoleContext.Provider>
      {/* <Footer /> */}
    </>
  );
};

export default BasicLayout;
