import React from "react";
import { useNavigate } from "react-router-dom";

const MainContent = ({ title, datas = [] }) => {
  const navigate = useNavigate();

  const handlePathNavigate = (path) => {
    navigate(path);
  };
  return (
    <div>
      {title}
      <div className="main_content_box">
        <div className="main_content_menubar">
          <p>
            워크
            <br />
            스페이스
          </p>
          <p className="main_separator"></p>
          <p>제목</p>
          <p className="main_separator"></p>
          <p>마감일</p>
        </div>
        <div className="main_content_children">
          {datas.map((data, index) => (
            <div key={index} className="">
              <div
                className="main_content_flex"
                onClick={() => handlePathNavigate(data.path)}
              >
                <p className="descname wsname">{data.workspaceName}</p>
                <p className="descname title">{data.title}</p>
                <p className="descname end">{data.end}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
