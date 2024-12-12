import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WSMemberRoleContext } from "../../../workspace/context/WSMemberRoleContext";
import Repo from "../../../auth/Repo";
import AuthApi from "../../../api/AuthApi";
import "./Header.css";

const Header = ({ workspaceData }) => {
  const isAuthenticated = Repo.isAuthenticated();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, []);
  const handleClickLogout = () => {
    AuthApi.logout().then((data) => {
      if (data.code === 200) {
        navigate("/auth/login");
      } else {
        // 뭘할까?
      }
    });
  };

  return (
    <header>
      {/* <h1>Mingle Space에 오신것을 환영합니다.</h1> */}
      <Link to="/">
        <img className="logo_icon" src="/profile1.png" alt="" />
      </Link>
      <h1 className="title">{workspaceData.name}</h1>

      {/* 버튼을 우측 정렬하는 div */}
      <div className="button-container">
        {isAuthenticated && <button onClick={handleClickLogout}>LOGOUT</button>}
      </div>
    </header>
  );
};

export default Header;
