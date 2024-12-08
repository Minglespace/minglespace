import React from "react";

const ProfileImage = ({ size, src }) => {
  return (
    <div className="">
      <img src={src} alt="" style={{ width: size, height: "auto", display:"flex", alignItems: "center" }} />
    </div>
  );
};

export default ProfileImage;
