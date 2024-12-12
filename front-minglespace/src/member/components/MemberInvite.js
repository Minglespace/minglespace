import React from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";
import { HOST_URL } from "../../api/Api";

const MemberInvite = ({ friends, handleInviteMember }) => {
  //이미지 체크함수
  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };

  return (
    <div className="section_container myFriends_container_item">
      <h2 className="section_container_title">
        워크스페이스 멤버를 <br />내 친구 목록에서 초대해보세요.
      </h2>
      <div className="myFriends_userInfo_container">
        {friends.map((userInfo) => (
          <div className="myFriends_userInfo_flex" key={userInfo.friendId}>
            <div>
              <Userinfo
                name={userInfo.name}
                role={userInfo.position}
                email={userInfo.email}
                src={imageUrlPathCheck(userInfo.imageUriPath)}
              />
            </div>
            {userInfo.inWorkSpace ? (
              <p>
                참여중인
                <br /> 멤버입니다
              </p>
            ) : (
              <button
                className="add_button_2"
                onClick={() => {
                  handleInviteMember(userInfo.friendId);
                }}
              >
                초대하기
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberInvite;
