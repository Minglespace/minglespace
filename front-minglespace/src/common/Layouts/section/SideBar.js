import React, { useContext } from "react";
import { Link, useParams } from "react-router-dom";

const SideBar = () => {
  const { workspaceId } = useParams();
  return (
    <div className="sidebar">
      <ul className="sidebar_menuitem">
        <li>
          <Link to="/workspace/">WorkSpace</Link>
        </li>
        <li>
          <Link to="/myfriends/">My Friends</Link>
        </li>
        {workspaceId && (
          <>
            <p>*****</p>
            <p>*****</p>
            <li>
              <Link to="/calendar/">Calendar</Link>
            </li>
            <li>
              <Link to={`/workspace/${workspaceId}/mileStone`}>MileStone</Link>
            </li>
            <li>
              <Link to={`/workspace/${workspaceId}/chat`}>ChatRoom</Link>
            </li>
            <li>
              <Link to={`/workspace/${workspaceId}/member`}>Member</Link>
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
