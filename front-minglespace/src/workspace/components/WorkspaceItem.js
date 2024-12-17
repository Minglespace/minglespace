import React from "react";
import { IoPersonSharp } from "react-icons/io5";

const WorkspaceItem = ({ id, name, count, wsdesc, onClick }) => {
  return (
    <div key={id} className="workspace_item_container" onClick={onClick}>
      <div>
        <div className="workspace_flex">
          <h1 className="workspace_name">{name}</h1>
          <div className="workspace_members_icon">
            <IoPersonSharp />
          </div>
          <p className="workspace_members">{count}명 참여중</p>
        </div>
        <p className="workspace_desc">{wsdesc}</p>
      </div>
    </div>
  );
};

export default WorkspaceItem;
