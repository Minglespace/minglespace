import React from "react";
import { Link } from "react-router-dom";

const SideBar = ({ addmenu }) => {
  return (
    <div className="sidebar">
      <ul className="sidebar_menuitem">
        <li>
          <Link to="/workspace/">WorkSpace</Link>
        </li>
        <li>My Friend</li>
        {addmenu && (
          <>
            <li>
              <Link to="/calendar/">Calendar</Link>
            </li>
            <li>
              <Link to="/milestone/">MileStone</Link>
            </li>
            <li>
              <Link to="/workspace/chat/">ChatRoom</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default SideBar;
