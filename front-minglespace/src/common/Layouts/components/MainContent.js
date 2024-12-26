import React from "react";

const MainContent = ({ children }) => {
  return (
    <div className="main_content_box">
      <div className="main_content_menubar">
        <p>워크스페이스명</p>
        <p>제목</p>
        <p>내용</p>
        <p>마감일</p>
      </div>
    </div>
  );
};

export default MainContent;
