import React from "react";
import { IoPersonSharp } from "react-icons/io5";

const WorkspaceItem = ({ id, name, count, wsdesc, onClick, data }) => {
  console.log("dataaaa : ", data);
  return (
    <div key={id} className="workspace_item_container" onClick={onClick}>
      <div>
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
        <p className="workspace_desc">{wsdesc}</p>
      </div>
    </div>
  );
};

export default WorkspaceItem;
