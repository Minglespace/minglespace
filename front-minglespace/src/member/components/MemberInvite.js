import React from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";

const MemberInvite = ({ friends, handleInviteMember }) => {
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
                src={userInfo.img}
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
