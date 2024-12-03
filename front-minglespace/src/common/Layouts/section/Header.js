import React from "react";
import { Link } from "react-router-dom";
const Header = ({ workspaceData }) => {
  return (
    <header>
      {/* <h1>Mingle Space에 오신것을 환영합니다.</h1> */}
      <Link to="/">
        <img className="logo_icon" src="/profile1.png" alt="" />
      </Link>
      <h1 className="title">{workspaceData.name}</h1>
    </header>
  );
};

export default Header;
