import React, { useEffect, useState } from "react";
import Sidebar from "./section/SideBar";
import Footer from "./section/Footer";
import Header from "./section/Header";
import { useParams } from "react-router-dom";
import { getOne } from "../../api/workspaceApi";
const initData = {
  id: "",
  name: "Mingle Space에 오신것을 환영합니다.",
  wsdesc: "",
  count: "",
};
const BasicLayout = ({ children }) => {
  const { workspaceId } = useParams();
  const [workspaceData, setWorkspaceData] = useState({ ...initData });

  useEffect(() => {
    if (workspaceId) {
      getOne(workspaceId).then((workspaceServerData) => {
        setWorkspaceData(workspaceServerData);
      });
    }
  }, [children]);
  return (
    <>
      <Header workspaceData={workspaceData} />
      <div className="midcontainer">
        <Sidebar addmenu={workspaceId} />
        <div className="main_container">{children}</div>
      </div>
      <Footer />
    </>
  );
};

export default BasicLayout;
