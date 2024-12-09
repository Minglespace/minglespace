import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WSMemberRoleContext } from "../../../workspace/context/WSMemberRoleContext";
// import Repo from "../../../auth/Repo";
// import AuthApi from "../../../api/AuthApi";
import UserInfoPopup from "../../../auth/UserInfoPopup";

// scss로 변경후 제거해야함
import "./Header.css"


const Header = ({ workspaceData }) => {
  const wsMember = useContext(WSMemberRoleContext);

  const navigate = useNavigate();


//   // 이게 필요한겨?
//   const isAuthenticated = Repo.isAuthenticated();
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/");
//     }
//   }, []);
// const handleClickLogout = () => {
//     AuthApi.logout().then((data) => {
//       if (data.code === 200) {
//         navigate("/auth/login");
//       } else {
//         // 뭘할까?
//       }
//     });
//   };

  return (
    <header>
      {/* <h1>Mingle Space에 오신것을 환영합니다.</h1> */}
      <Link to="/">
        <img className="logo_icon" src="/profile1.png" alt="" />
      </Link>
      <h1 className="title">{workspaceData.name}</h1>

      {/* 버튼을 우측 정렬하는 div */}
      <div className="button-container">

        <UserInfoPopup/>

      </div>
    </header>
  );
};

export default Header;
