import React, { useState } from "react";
import Modal from "../../common/Layouts/components/Modal";
import UserInfoDetail from "../../common/Layouts/components/UserInfoDetail";
import Userinfo from "../../common/Layouts/components/Userinfo";

const MemberList = ({ members, onClickMember }) => {
  // 역할 변환 함수 (영어를 한글로)
  const transformRole = (role) => {
    switch (role) {
      case "MEMBER":
        return "멤버";
      case "LEADER":
        return "리더";
      default:
        return "서브리더";
    }
  };
  return (
    <div className="section_container myFriends_container_item">
      <h1 className="section_container_title">Members</h1>
      <div className="myFriends_userInfo_container">
        {members.map((userInfo) => (
          <div
            className="myFriends_userInfo_flex myFriends_userInfo_view"
            key={userInfo.wsMemberId}
            onClick={() => onClickMember(userInfo)}
          >
            <Userinfo
              name={userInfo.name}
              role={transformRole(userInfo.role)}
              email={userInfo.email}
              src={userInfo.img}
            />
            <div>참여중...</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
