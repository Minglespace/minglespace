import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WSMemberRoleContext } from "../../../workspace/context/WSMemberRoleContext";


import UserProfilePopup from "../../../auth/UserProfilePopup_1209";


const Header = ({ workspaceData }) => {
  const wsMember = useContext(WSMemberRoleContext);
  const navigate = useNavigate();

  return (
    <header>
      {/* <h1>Mingle Space에 오신것을 환영합니다.</h1> */}
      <Link to="/">
        <img className="logo_icon" src="/profile1.png" alt="" />
      </Link>
      <h1 className="title">{workspaceData.name}</h1>


      {/* 버튼을 우측 정렬하는 div */}
      <div className="button-container">
        <UserProfilePopup/>
      </div>


    </header>
  );
};

export default Header;
