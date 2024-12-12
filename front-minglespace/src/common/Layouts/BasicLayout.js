import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "./section/SideBar";
import Footer from "./section/Footer";
import Header from "./section/Header";
import { useParams } from "react-router-dom";

import WorkspaceApi from "../../api/workspaceApi";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";

const initData = {
  id: "",
  name: "Mingle Space에 오신것을 환영합니다.",
  wsdesc: "",
  count: "",
};
const BasicLayout = ({ children }) => {
  const { workspaceId } = useParams();
  const [workspaceData, setWorkspaceData] = useState({ ...initData });
  const [wsMemberData, setWsMEmberData] = useState({ memberId: "", role: "" });

  const getWsMemberRole = useCallback(() => {
    WorkspaceApi.getWsMemberRole(workspaceId).then((wsMemberServiceData) => {
      setWsMEmberData(wsMemberServiceData);
    });
  }, [workspaceId, setWsMEmberData]);

  useEffect(() => {
    if (workspaceId) {
      WorkspaceApi.getOne(workspaceId).then((workspaceServerData) => {
        setWorkspaceData(workspaceServerData);
      });
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
        <Header workspaceData={workspaceData} />
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
