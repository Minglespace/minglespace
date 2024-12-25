import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./section/SideBar";
import Footer from "./section/Footer";
import Header from "./section/Header";
import { useNavigate, useParams } from "react-router-dom";

import WorkspaceApi from "../../api/workspaceApi";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";
import { getErrorMessage, getErrorStatus } from "../Exception/errorUtils";
import api from "../../api/Api";

const BasicLayout = ({ children }) => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [wsMemberData, setWsMEmberData] = useState({ memberId: "", role: "" });

  const getWsMemberRole = useCallback(async () => {
    try {
      const wsMemberRoleData = await WorkspaceApi.getWsMemberRole(workspaceId);
      setWsMEmberData(wsMemberRoleData);
    } catch (error) {
      if (getErrorStatus(error) === 403) {
        navigate("/workspace");
      } else {
        alert(`권한 조회에 실패하였습니다.\n원인:${getErrorMessage(error)}`);
      }
    }
  }, [workspaceId, navigate]);

  useEffect(() => {

    api.setOnWithdrawalAbleCallback(handleWithdrawalAble);

    if (workspaceId) {
      getWsMemberRole();
    }

    return () =>{
      api.setOnWithdrawalAbleCallback(null);
    }

  }, [workspaceId, getWsMemberRole]);

  const refreshMemberContext = useCallback(() => {
    getWsMemberRole();
  }, [getWsMemberRole]);

  // 회원탈퇴 관련 콜백 함수
  const handleWithdrawalAble = (msStatus) => {
    console.log("회원탈퇴가 가능합니다. msStatus: ", msStatus);
    // 회원탈퇴창으로 이동하는 로직 추가
    // 예를 들어, 알림 팝업을 띄우거나, 로그인 페이지로 이동하는 등의 처리를 할 수 있습니다.
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
          <div className="main_container">{children}</div>
        </div>
      </WSMemberRoleContext.Provider>
      <Footer />
    </>
  );
};

export default BasicLayout;
