﻿import React from "react";
import ProfileImage from "./ProfileImage";
import Button from "./Button";

const Userinfo = ({ name, role, email, src, size }) => {
  return (
    <div className="userInfo_box">
      <ProfileImage src={src} userName={name} size={size} />
      <div className="userInfo_context">
        <div>
          <h2>{name}</h2>
          <p>{role}</p>
        </div>
        <p>{email}</p>
      </div>
    </div>
  );
};

export default Userinfo;
