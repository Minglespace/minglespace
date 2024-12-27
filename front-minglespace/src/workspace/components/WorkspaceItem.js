import React from "react";
import { IoPersonSharp } from "react-icons/io5";

const WorkspaceItem = ({ id, name, count, wsdesc, onClick, data }) => {
  const completeRate =
    data.total === 0 ? 0 : Math.round((data.completed / data.total) * 100);
  return (
    <div key={id} className="workspace_item_container" onClick={onClick}>
      <div className="workspace_item_width">
        <div className="workspace_flex">
          <h1 className="workspace_name">{name}</h1>
          <div className="workspace_members_icon">
            <IoPersonSharp />
          </div>
          <p className="workspace_members">{count}명 참여중</p>
          <div className="workspace_milestone_category">
            <p>전체 작업 : {data.total}건</p>
            <div className="workspace_not_start"></div>
            <p>시작 전 : {data.not_start}건</p>
            <div className="workspace_inprogress"></div>
            <p>진행중 : {data.in_progress}건</p>
            <div className="workspace_completed"></div>
            <p>완료 : {data.completed}건</p>
            <div className="workspace_on_hold"></div>
            <p>보류 : {data.on_hold}건</p>
          </div>
        </div>
        <div className="workspace_desc_complete_flex">
          <div className="workspace_desc">
            <div className="circle"></div>
            {wsdesc}
          </div>
          <div className="complete_progress_container">
            <div className="animation_contaienr">
              <div className="complete_bar_container">
                <div
                  className="complete_bar"
                  style={{ width: `${completeRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceItem;
