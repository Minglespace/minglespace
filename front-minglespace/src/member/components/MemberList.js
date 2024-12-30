import React, { useState } from "react";
import Modal from "../../common/Layouts/components/Modal";
import UserInfoDetail from "../../common/Layouts/components/UserInfoDetail";
import Userinfo from "../../common/Layouts/components/Userinfo";
import { HOST_URL } from "../../api/Api";

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

  //이미지 체크함수
  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };

  return (
    <div className="section_container myFriends_container_item">
      <h1 className="section_container_title">Members</h1>
      <br />
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
              email={
                userInfo.withdrawalType === "DONE"
                  ? "unsubscribe"
                  : userInfo.email
              }
              src={imageUrlPathCheck(userInfo.imageUriPath)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
