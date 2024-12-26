import React, { useEffect, useState } from "react";
import MainNotification from "./MainNotification";
import { NotificationProvider } from "../notification/context/NotificationContext";
import MainApi from "../api/MainApi";
import MainContent from "../common/Layouts/components/MainContent";
import { getErrorMessage } from "../common/Exception/errorUtils";
import { useNavigate } from "react-router-dom";
import MainMilestone from "./MainMilestone";

const MainComponent = () => {
  // const [mainData, setMainData] = useState({});
  const [newNotice, setNewNotice] = useState([]);
  const [deadlineNotice, setDeadlineNotice] = useState([]);
  const [deadlineTodo, setDeadlineTodo] = useState([]);
  const [milestoneData, setMilestoneData] = useState([]);

  const getMainData = async () => {
    try {
      const result = await MainApi.getMainNotice();
      setNewNotice(result.mainNewNotice);
      setDeadlineNotice(result.mainDeadlineNotice);
      setDeadlineTodo(result.mainDeadlineTodo);
      setMilestoneData(result.workspaceAndMilestone);
    } catch (error) {
      alert(
        `캘린더 수정 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  };

  useEffect(() => {
    getMainData();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div className="main_dashboard_container">
        <div className="main_milestone_data_container">
          <MainMilestone title={"마일스톤 진행 현황"} datas={milestoneData} />
        </div>
        <div className="main_flex_box">
          <div className="main_newnotice_container">
            <MainContent title={"최신 공지"} datas={newNotice} />
          </div>
          <div className="main_deadlinenotice_container">
            <MainContent title={"마감임박 공지"} datas={deadlineNotice} />
          </div>
          <div className="main_deadlinetodo_container">
            <MainContent title={"마감임박 할일"} datas={deadlineTodo} />
          </div>
        </div>
        {/* <p>일정 영역</p>
      </div>
      <div style={{ position: "relative", width: "500px", border: "2px solid lightblue" }}>
        <p>채팅방 영역</p> */}
      </div>

      {/* 알림 목록 */}
      <NotificationProvider>
        <MainNotification />
      </NotificationProvider>
    </div>
  );
};

export default MainComponent;
