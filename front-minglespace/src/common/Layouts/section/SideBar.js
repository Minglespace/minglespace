import React, { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { WSMemberRoleContext } from "../../../workspace/context/WSMemberRoleContext";

const SideBar = ({ addmenu }) => {
  const { workspaceId } = useParams();
  const { memberId } = useContext(WSMemberRoleContext);
  return (
    <div className="sidebar">
      <ul className="sidebar_menuitem">
        <li>
          <Link to="/workspace/">WorkSpace</Link>
        </li>
        <li>
          <Link to="/myfriends/">My Friends</Link>
        </li>
        {addmenu && (
          <>
            <li>
              <Link to="/calendar/">Calendar</Link>
            </li>
            <li>
              <Link to="/milestone/">MileStone</Link>
            </li>
            <li>
              <Link to={`/workspace/${workspaceId}/chat`}>ChatRoom</Link>
            </li>
            <li>
              <Link to={`/workspace/${workspaceId}/todo`}>Todo</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default SideBar;
