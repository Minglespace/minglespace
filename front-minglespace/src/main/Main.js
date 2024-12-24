import React from "react";
import Userinfo from "../common/Layouts/components/Userinfo";
import Button from "../common/Layouts/components/Button";
import MainNotification from "./MainNotification";
import { NotificationProvider } from "../notification/context/NotificationContext";

const MainComponent = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* <h1>Main 입니다,.</h1> */}
      {/* <Userinfo
        name="홍길동"
        role="팀장"
        email="asd@naver.com"
        src="/profile1.png"
      />
      <Button btnStyle="add_button" title="추가" />
      <Button btnStyle="add_button_2" title="추가" />
      <Button btnStyle="exit_button" title="나가기" /> */}
      <div
        style={{
          position: "relative",
          width: "660px",
          border: "2px solid orange",
        }}
      >
        <div>최신공지</div>
        <div>마감임박 공지</div>
        <div>마감임박 마일스톤</div>
        <div>마감임박 할일</div>
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
