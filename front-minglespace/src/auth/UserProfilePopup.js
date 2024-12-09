import React, { useState } from "react";
import { LogOut, User, Edit } from "lucide-react";
import AuthApi from "../api/AuthApi";
import { useNavigate } from "react-router-dom";


import './UserProfilePopup.css'; // CSS 파일을 import합니다.


export default function UserInfoPopup() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [userInfo, setUserInfo] = useState({
    profileImage: "",
    name: "",
    position: "",
    email: "",
    phone: "",
    introduction: "",
  });

  const [editedUserInfo, setEditedUserInfo] = useState({
    profileImage: "",
    name: "",
    position: "",
    email: "",
    phone: "",
    introduction: "",
  });

  const handleClickOpen = async () => {
    const nowIsOpen = !isOpen;

    if (nowIsOpen) {
      const res = await AuthApi.userInfo();
      setUserInfo(res);
      setEditedUserInfo({
        profileImage: res.profileImage,
        name: res.name,
        position: res.position,
        email: res.email,
        phone: res.phone,
        introduction: res.introduction,
      });
    }

    setIsOpen(nowIsOpen);
  };

  const handleClickLogout = () => {
    AuthApi.logout().then((data) => {
      if (data.code === 200) {
        navigate("/auth/login");
      }
    });
  };

  const handleEditModalOpen = () => {
    setIsEditModalOpen(true);
    setIsOpen(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    console.log("Updated User Info: ", editedUserInfo);
    // 예시: AuthApi.updateUserInfo(editedUserInfo);
    setIsEditModalOpen(false);
  };

  return (
    <div className="popup-wrapper">
      <button
        onClick={handleClickOpen}
        className="user-info-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User size={24} />
      </button>

      {isOpen && (
        <div className="popup-content left-popup">
          <div className="popup-header">
            <img
              src={userInfo.profileImage || "https://via.placeholder.com/64"}
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
            <button onClick={handleClickLogout} className="logout-button">
              <LogOut size={16} />
              로그아웃
            </button>
            <button onClick={handleEditModalOpen} className="edit-button">
              <Edit size={16} />
              정보 수정
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-container">
            <h3>정보 수정</h3>

            <div className="form-group">
              <label htmlFor="profileImage">프로필 이미지 URL</label>
              <input
                type="text"
                id="profileImage"
                name="profileImage"
                value={editedUserInfo.profileImage}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedUserInfo.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">직위</label>
              <input
                type="text"
                id="position"
                name="position"
                value={editedUserInfo.position}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedUserInfo.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">전화번호</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={editedUserInfo.phone}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="introduction">소개</label>
              <textarea
                id="introduction"
                name="introduction"
                value={editedUserInfo.introduction}
                onChange={handleInputChange}
                className="form-input"
                rows="4"
              />
            </div>

            <div className="modal-footer">
              <button onClick={handleSaveChanges} className="save-button">
                저장
              </button>
              <button onClick={handleEditModalClose} className="close-button">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
