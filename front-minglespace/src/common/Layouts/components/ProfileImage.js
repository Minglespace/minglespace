import React, { useEffect, useState } from "react";
import Repo from "../../../auth/Repo";

const ProfileImage = ({ src, userName, size = 70 }) => {

  const [imgError, setImgError] = useState(false);  // 이미지 로딩 실패 여부를 상태로 관리
  const [backgroundColor, setBackgroundColor] = useState(null);
  const profileImage = src || null;

  useEffect(() => {
    const savedColor = Repo.getProfileColor(userName);
    if(!savedColor){
      const newColor = getRandomColor();
      Repo.setProfileColor(userName, newColor);
      setBackgroundColor(newColor);
    }else{
      setBackgroundColor(savedColor);
    }
  },[userName]);

  const handleImageError = () => {
    setImgError(true);  // 이미지 로딩 실패 시 상태 변경
  };

  const renderProfileImage = () => {
    if (profileImage && !imgError) {
      return (
        <img
          src={profileImage}
          className="round_user_image"
          alt="Profile"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
          }}
          onError={handleImageError}  // 이미지 로딩 실패 시 처리
        />
      );
    } else {
      // 이미지가 없으면 이름의 첫 글자로 기본 이미지를 생성
      const firstLetter = (userName) ? userName.charAt(0).toUpperCase() : "A";

      return (
        <div
          className="round_user_image"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: backgroundColor,
            color: "white",
            fontSize: `${size / 2}px`,
          }}
        >
          {firstLetter}
        </div>
      );
    }
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return <>{renderProfileImage()}</>;
};

export default ProfileImage;
