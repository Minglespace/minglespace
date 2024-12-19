import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";

import Userinfo from "../common/Layouts/components/Userinfo";
import ProfileImage from "../common/Layouts/components/ProfileImage";

import Repo from "./Repo";
import AuthApi from "../api/AuthApi";
import { HOST_URL } from "../api/Api";
import { AuthStatusOk } from "../api/AuthStatus";

//============================================================================================
//============================================================================================
//============================================================================================
//============================================================================================
//============================================================================================
export default function UserInfoPopup() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dontUseProfileImage, setDontUseProfileImage] = useState(false);
  const [userInfo, setUserInfo] = useState({
    profileImagePath: "",
    name: "",
    position: "",
    email: "",
    phone: "",
    introduction: "",
    localImage: "",
    socialLogin:"",
  });

  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 파일 선택
  const fileInputRef = useRef(null);

  useEffect(() => {
    getUserInfo();
  }, []);

  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================
  //============================================================================================

  const getUserInfo = async () => {
    const res = await AuthApi.userInfo();
    console.log("userInfo res : ", res);
    setUserInfo(res);
  };

  const handleClickOpen = async () => {
    const nowIsOpen = !isOpen;
    if (nowIsOpen) {
      getUserInfo();
    }
    setIsOpen(nowIsOpen);
  };

  const handleClickSetting = () => {
    setIsEditing(true);
  };

  const handleClickLogout = async () => {
    await AuthApi.logout().then((data)=>{
      if (AuthStatusOk(data.msStatus)) {
        navigate("/auth/login");
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
    userInfo.dontUseProfileImage = dontUseProfileImage;
    const data = await AuthApi.updateUserInfo(userInfo, userInfo.localImage);
    if (AuthStatusOk(data.msStatus)) {
      setUserInfo(prevUserInfo => ({
        ...prevUserInfo,
        profileImagePath: data.profileImagePath,
        name: data.name,
        position: data.position,
        phone: data.phone,
        introduction: data.introduction,
        socialLogin: data.socialLogin,
      }));
      setIsEditing(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setDontUseProfileImage(false);
      setSelectedImage(URL.createObjectURL(file));
      userInfo.localImage = file;
    }
  };

  const handleClickDontUseImage = () => {
    Repo.clearProfileColor();
    setSelectedImage(null);
    setDontUseProfileImage(true);
  };

  const getHostImagePath = () => {
    if (dontUseProfileImage) return null;

    if (userInfo.profileImagePath)
      return `${HOST_URL}` + userInfo.profileImagePath;
    else return null;
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
        <ProfileImage
          src={selectedImage || getHostImagePath()}
          userName={userInfo.name}
          size={50}
        />
      </button>

      {isOpen && (
        <div className="popup-content">
          <div className="popup-header">
            {isEditing ? (
              <div className="user-info">
                <div className="profile-container">
                  <ProfileImage
                    src={selectedImage || getHostImagePath()}
                    userName={userInfo.name}
                  />
                  <button
                    className="userInfo-button"
                    onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 선택창 열기
                    disabled={userInfo.socialLogin}
                  >
                    변경
                  </button>
                  <button
                    className="userInfo-button"
                    onClick={handleClickDontUseImage}
                    disabled={userInfo.socialLogin}
                  >
                    제거
                  </button>
                  <input
                    className="hidden-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  ></input>
                </div>

                <label className="input-label" htmlFor="name">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={userInfo.socialLogin}
                />
                <label className="input-label" htmlFor="position">
                  직책
                </label>
                <input
                  id="position"
                  type="text"
                  name="position"
                  value={userInfo.position}
                  onChange={handleInputChange}
                  className="input-field"
                />
                <label className="input-label" htmlFor="email">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={userInfo.socialLogin}
                />
                <label className="input-label" htmlFor="phone">
                  전화번호
                </label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={userInfo.socialLogin}
                />
                <label className="input-label" htmlFor="introduction">
                  소개
                </label>
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
                src={getHostImagePath()}
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
                  <p className="detail-value truncate">
                    {userInfo.introduction}
                  </p>
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
