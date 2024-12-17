import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./section/SideBar";
import Footer from "./section/Footer";
import Header from "./section/Header";
import { useNavigate, useParams } from "react-router-dom";

import WorkspaceApi from "../../api/workspaceApi";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";
import { getErrorMessage, getErrorStatus } from "../Exception/errorUtils";

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
    if (workspaceId) {
      getWsMemberRole();
    }
  }, [workspaceId, getWsMemberRole]);

  const refreshMemberContext = useCallback(() => {
    getWsMemberRole();
  }, [getWsMemberRole]);

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
