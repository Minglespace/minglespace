import React from "react";
import { useNavigate } from "react-router-dom";
import NoData from "./NoData";

const MainContent = ({ title, datas = [] }) => {
  const navigate = useNavigate();

  const handlePathNavigate = (path) => {
    navigate(path);
  };

  const mainContentRender = () => {
    if (title === "최신등록 공지") {
      return (
        <div>
          <p className="content_title">{title}</p>
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
              <p style={{ width: "90px" }}>일정</p>
            </div>
            <div className="main_content_children">
              {datas.length !== 0 ? (
                <>
                  {datas.map((data, index) => {
                    const [startDate, startTime] = data.start.split("T");
                    const [endDate, endTime] = data.end.split("T");
                    const shortStartTime = startTime.substring(0, 5);
                    return (
                      <div key={index} className="">
                        <div
                          className="main_content_flex"
                          onClick={() => handlePathNavigate(data.path)}
                        >
                          <p className="descname wsname">
                            {data.workspaceName}
                          </p>
                          <p className="descname title">{data.title}</p>
                          {data.start === data.end ? (
                            <p className="descname end">
                              {startDate} {shortStartTime}
                            </p>
                          ) : (
                            <p className="descname end">
                              {startDate} ~ <br />
                              {endDate}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="nodata_align">
                  <NoData />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <p className="content_title">{title}</p>
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
              <p style={{ width: "90px" }}>마감기한</p>
            </div>
            <div className="main_content_children">
              {datas.length !== 0 ? (
                <>
                  {datas.map((data, index) => {
                    const [endDate, endTime] = data.end.split("T");
                    const shortEndTime = endTime.substring(0, 5);
                    return (
                      <div key={index} className="">
                        <div
                          className="main_content_flex"
                          onClick={() => handlePathNavigate(data.path)}
                        >
                          <p className="descname wsname">
                            {data.workspaceName}
                          </p>
                          <p className="descname title">{data.title}</p>
                          {data.start === data.end ? (
                            <p className="descname end">
                              {endDate} {shortEndTime}
                            </p>
                          ) : (
                            <p className="descname end">{endDate}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="nodata_align">
                  <NoData />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };
  return <>{mainContentRender()}</>;
};

export default MainContent;
