import React, { useContext, useState } from "react";
import ProfileImage from "./ProfileImage";
import { WSMemberRoleContext } from "../../../workspace/context/WSMemberRoleContext";
const UserInfoDetail = ({
  user,
  src,
  isModal,
  handleRemoveMember,
  handleTransferLeader,
  handleTransferRole,
}) => {
  const {
    wsMemberData: { memberId },
  } = useContext(WSMemberRoleContext);
  //중복 제거해야하는데 css로 적용하고 나서 진행예정

  const handleSelectChange = (event) => {
    handleTransferRole(user.wsMemberId, event.target.value);
  };

  const renderUserInfo = () => {
    return (
      <>
        <h2>유저 상세보기</h2>
        <div className="flex_center">
          <ProfileImage src={src} userName={user.name} size={200} />
        </div>
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
      </>
    );
  };

  const renderContent = () => {
    if (isModal) {
      //모달형식으로 보여줄꺼면 이거
      if (user.deleteFlag) {
        return (
          <div>
            <h2>유저 상세보기</h2>
            <h3 style={{ color: "red" }}>탈퇴한 회원입니다.</h3>
          </div>
        );
      }
      return (
        <div className="userInfo_detail_modal_container">
          {renderUserInfo()}
        </div>
      );
    } else {
      //모달이 아니면 이거
      if (handleRemoveMember && user.wsMemberId !== memberId) {
        //리더이면서 본인이 아니라면
        return (
          <div className="userInfo_detail_modal_container">
            <div className="flex_center">
              <div>{renderUserInfo()}</div>
            </div>
            <button
              className="add_button_2"
              onClick={() => handleRemoveMember(user.wsMemberId)}
            >
              추방하기
            </button>

            <button
              className="add_button_2"
              onClick={() => handleTransferLeader(user.wsMemberId)}
            >
              리더 위임하기
            </button>

            <label htmlFor="roleOptions">권한 변경</label>
            <select
              id="roleOptions"
              value={user.role}
              onChange={handleSelectChange}
            >
              <option value="MEMBER">멤버 </option>
              <option value="SUB_LEADER">서브 리더</option>
            </select>
          </div>
        );
      } else {
        return (
          <div className="userInfo_detail_modal_container">
            {renderUserInfo()}
          </div>
        );
      }
    }
  };

  return <>{renderContent()}</>;
};

export default UserInfoDetail;
