import React from "react";
import ProfileImage from "./ProfileImage";

const UserInfoDetail = ({ user }) => {
  console.log(user);
  return (
    <div className="userInfo_detail_container">
      <h2>유저 상세보기</h2>
      <ProfileImage
        src={user.src}
        imgClass={"round_user_detail_image"}
        iconClass={"user_alt_detail_icon"}
      />
      <p>
        <b>이름</b> : {user.name}
      </p>
      <p>
        <b>직책</b> : {user.position}
      </p>
      <p>
        <b>전화번호</b> : {user.phone}
      </p>
      <p>
        <b>이메일</b> : {user.email}
      </p>
      <p>
        <b>한줄소개</b> : {user.introduction}
      </p>
    </div>
  );
};

export default UserInfoDetail;
