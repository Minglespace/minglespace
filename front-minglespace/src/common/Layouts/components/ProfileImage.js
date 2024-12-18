import React from "react";
import Repo from "../../../auth/Repo";

const ProfileImage = ({ src, userName, size = 70 }) => {
  const profileImage = src || null;

  const renderProfileImage = () => {
    if (profileImage) {
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
        />
      );
    } else {
      // 이미지가 없으면 이름의 첫 글자로 기본 이미지를 생성
      const firstLetter = userName.charAt(0).toUpperCase();
      const backgroundColor = getRandomColor();

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
    let color = Repo.getProfileColor();
    if (color) return color;

    const letters = "0123456789ABCDEF";
    color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    Repo.setProfileColor(color);

    return color;
  };
  return <>{renderProfileImage()}</>;
};

export default ProfileImage;
