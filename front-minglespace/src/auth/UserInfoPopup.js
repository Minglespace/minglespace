import React, { useRef, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import AuthApi from "../api/AuthApi";
import './UserInfoPopup.css'; // CSS 파일을 import합니다.
import { useNavigate } from "react-router-dom";
import Userinfo from "../common/Layouts/components/Userinfo";
import default_img from "../asset/imgs/profile1.png";


//============================================================================================
//============================================================================================
//============================================================================================
//============================================================================================
//============================================================================================ 
export default function UserInfoPopup() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Manage edit state
  const [userInfo, setUserInfo] = useState({
    profileImage: "",
    name: "",
    position: "",
    email: "",
    phone: "",
    introduction: "",
  });

  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 파일 선택
  const fileInputRef = useRef(null);

  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================
  

  const handleClickOpen = async () => {
    const nowIsOpen = !isOpen;

    if (nowIsOpen) {
      const res = await AuthApi.userInfo();
      setUserInfo(res);
    }

    setIsOpen(nowIsOpen);
  };

  const handleClickSetting = () => {
    setIsEditing(true); // Switch to edit mode
  };

  const handleClickLogout = () => {
    AuthApi.logout().then((data) => {
      if (data.code === 200) {
        navigate("/auth/login");
      } else {
        // Handle error
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    // You can send updated user info to your API here (e.g., AuthApi.updateUserInfo(userInfo))
    const res = await AuthApi.updateUserInfo(userInfo, userInfo.profileImage);
    if (res.code === 200) {
      setIsEditing(false); // Exit edit mode
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null; // 파일이 있는지 확인
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // 선택된 파일을 미리보기로 사용

      userInfo.profileImage = file;
      // setNewChatRoomData((prev) => ({
      //   ...prev,
      //   image: file,
      // }));
    }
  };


  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================
  
  return (
    <div className="relative">
      <button
        onClick={handleClickOpen}
        className="user-info-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User size={24} />
      </button>

      {isOpen && (
        <div className="popup-content">
          <div className="popup-header">
            {isEditing ? (
              <div className="user-info">
                {/* 이미지 선택 (기본 동그라미 이미지와 선택된 이미지 변경) */}
                <div className="modal_img">
                  <img
                    className="chat_create_Img"
                    src={selectedImage || default_img}
                    alt="이미지"
                  />
                </div>

                <button
                  className="select_img_btn"
                  onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 선택창 열기
                >
                  변경
                </button>
                
                <input
                  className="hidden-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                ></input>
                
                <label className="input-label" htmlFor="name">이름</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  className="input-field"
                />
                <label className="input-label" htmlFor="position">직책</label>
                <input
                  id="position"
                  type="text"
                  name="position"
                  value={userInfo.position}
                  onChange={handleInputChange}
                  className="input-field"
                />
                <label className="input-label" htmlFor="email">이메일</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  className="input-field"
                />
                <label className="input-label" htmlFor="phone">전화번호</label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
                <label className="input-label" htmlFor="introduction">소개</label>
                <textarea
                  id="introduction"
                  name="introduction"
                  value={userInfo.introduction}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            ) : (
              <Userinfo
                name={userInfo.name}
                role={userInfo.position}
                email={userInfo.email}
                src={userInfo.profileImage}
              />
            )}
          </div>

          <div className="user-details">
            {!isEditing && (
              <>
                <div>
                  <p className="detail-label">전화번호</p>
                  <p className="detail-value">{userInfo.phone}</p>
                </div>
                <div>
                  <p className="detail-label">소개</p>
                  <p className="detail-value truncate">{userInfo.introduction}</p>
                </div>
              </>
            )}
          </div>

          <div className="popup-footer">
            {isEditing ? (
              <>
                <button onClick={handleSaveChanges} className="logout-button">
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)} // Exit edit mode
                  className="logout-button"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button onClick={handleClickSetting} className="logout-button">
                  <Settings size={16} />
                  정보변경
                </button>
                <button onClick={handleClickLogout} className="logout-button">
                  <LogOut size={16} />
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
