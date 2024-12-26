import React, { useEffect } from "react";
import MainNotification from "./MainNotification";
import { NotificationProvider } from "../notification/context/NotificationContext";
import MainApi from "../api/MainApi";
import MainContent from "../common/Layouts/components/MainContent";

const MainComponent = () => {
  useEffect(() => {
    MainApi.getMainNotice().then((data) => {
      console.log("data : ", data);
    });
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div className="main_dashboard_container">
        <div className="main_milestone_data_container">마감임박 마일스톤</div>
        <div className="main_flex_box">
          <div className="main_newnotice_container">
            <MainContent>
              <div>최신 공지</div>
            </MainContent>
          </div>
          <div className="main_deadlinenotice_container">
            <MainContent>
              <div>마감임박 공지</div>
            </MainContent>
          </div>
          <div className="main_deadlinetodo_container">
            <MainContent>
              <div>마감임박 할일</div>
            </MainContent>
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
