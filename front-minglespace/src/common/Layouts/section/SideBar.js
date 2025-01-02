import { Link, useParams } from "react-router-dom";

const SideBar = () => {
  const { workspaceId } = useParams();
  return (
    <div className="sidebar">
      <ul className="sidebar_menuitem">
        <p className="workspace_sidemenu">Main</p>
        <li>
          <Link to="/workspace/">WorkSpace</Link>
        </li>
        <li>
          <Link to="/myfriends/">My Friends</Link>
        </li>
        {workspaceId && (
          <>
            <p className="workspace_sidemenu">IN Workspace</p>
            <li>
              <Link to={`/workspace/${workspaceId}/calendar`}>Calendar</Link>
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
        <li className="side_about_us">
          <Link to="/aboutus">About Us</Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
