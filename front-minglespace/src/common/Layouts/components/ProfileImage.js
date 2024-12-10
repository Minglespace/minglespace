import React from "react";
import { IoPersonSharp } from "react-icons/io5";

const ProfileImage = ({ src, imgClass, iconClass }) => {
  return (
    <>
      {src ? (
        <img className={imgClass} src={src} alt="Profile" />
      ) : (
        <IoPersonSharp className={iconClass} />
      )}
    </>
  );
};

export default ProfileImage;
