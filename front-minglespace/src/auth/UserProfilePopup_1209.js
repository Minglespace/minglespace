import { User, LogOut } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
// import './UserInfoPopup.css';  // Import the CSS file

export default function UserProfilePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="user-info-popup-container">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="user-info-button"
      >
        <User size={16} />
        회원정보
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="popup-content"
        >
          <div className="popup-header">
            {/* <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile"
              className="profile-img"
            /> */}
            <h3 className="profile-name">김지훈</h3>
            <p className="profile-job">Software Engineer</p>
          </div>

          <div className="popup-body">
            <div>
              <p className="label">이메일</p>
              <p className="info">jihoon.kim@example.com</p>
            </div>

            <div>
              <p className="label">연락처</p>
              <p className="info">010-1234-5678</p>
            </div>

            <div>
              <p className="label">소개</p>
              <p className="info">
                프론트엔드 개발자로 5년간 근무하였으며, 사용자 경험 향상에
                관심이 많습니다. React와 TypeScript를 주로 사용하며 새로운
                기술 학습을 즐깁니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              // Add logout logic here
            }}
            className="logout-button"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
