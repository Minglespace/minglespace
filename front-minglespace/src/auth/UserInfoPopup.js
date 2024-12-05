import React, { useState } from "react";
import { LogOut, User } from "lucide-react";


import AuthApi from "../api/AuthApi";

import './UserInfoPopup.css'; // CSS 파일을 import합니다.
import { useNavigate } from "react-router-dom";


export default function UserInfoPopup() {

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [userInfo, setUserInfo] = useState({
    profileImage : "",
    name : "",
    position : "",
    email : "",
    phone : "",
    introduction : "",
  });


  const handleClickOpen = async ()=>{

    const nowIsOpen = !isOpen;

    if(nowIsOpen){
      const res = await AuthApi.userInfo();
      setUserInfo(res);
    }


    setIsOpen(nowIsOpen);

    
  }


  const handleClickLogout = () =>{
    AuthApi.logout().then((data) => {
      if(data.code === 200){
        navigate("/auth/login");
      }else{
        // 뭘할까?
      }        
    });   
  }


  return (
    <div className="relative">
      <button
        onClick={handleClickOpen }
        className="user-info-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User size={24} />
      </button>

      {isOpen && (
        <div className="popup-content">
          <div className="popup-header">
            <img
              // src={userInfo.profileImage}
              alt="Profile"
              className="profile-image"
            />
            <div className="user-info">
              <h3 className="user-name">{userInfo.name}</h3>
              <p className="user-role">{userInfo.position}</p>
            </div>
          </div>

          <div className="user-details">
            <div>
              <p className="detail-label">이메일</p>
              <p className="detail-value">{userInfo.email}</p>
            </div>

            <div>
              <p className="detail-label">전화번호</p>
              <p className="detail-value">{userInfo.phone}</p>
            </div>

            <div>
              <p className="detail-label">소개</p>
              <p className="detail-value truncate">{userInfo.introduction}</p>
            </div>
          </div>

          <div className="popup-footer">
            <button
              onClick={handleClickLogout}
              className="logout-button"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
