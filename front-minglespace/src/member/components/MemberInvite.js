import React from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";

const MemberInvite = ({ friends, handleInviteMember }) => {
  return (
    <div className="section_container myFriends_container_item">
      <h1 className="section_container_title">My Friends</h1>
      <div className="myFriends_userInfo_container">
        {friends.map((userInfo) => (
          <div className="myFriends_userInfo_flex" key={userInfo.id}>
            <div>
              <Userinfo
                name={userInfo.name}
                role={userInfo.position}
                email={userInfo.email}
                src={userInfo.img}
              />
            </div>
            {userInfo.inWorkSpace ? (
              <p>참여중...</p>
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
