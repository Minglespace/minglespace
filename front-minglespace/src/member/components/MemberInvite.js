import React from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";
import { HOST_URL } from "../../api/Api";
import NoData from "../../common/Layouts/components/NoData";

const MemberInvite = ({ friends, handleInviteMember }) => {
  //이미지 체크함수
  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };

  return (
    <div className="section_container myFriends_container_item member_inviteItem">
      <h2 className="section_container_title">
        워크스페이스 멤버를 <br />내 친구 목록에서 초대 해보세요.
      </h2>
      <hr style={{ marginTop: "4px", padding: 0, visibility: "hidden" }} />
      {friends.length === 0 ? (
        <NoData title={"친구를 추가해보세요!"} />
      ) : (
        <div className="myFriends_userInfo_container member_infoItem">
          {friends.map((userInfo) => (
            <div className="myFriends_userInfo_flex" key={userInfo.friendId}>
              <div>
                <Userinfo
                  name={userInfo.name}
                  role={userInfo.position}
                  email={
                    userInfo.withdrawalType === "DONE"
                      ? "unsubscribe"
                      : userInfo.email
                  }
                  src={imageUrlPathCheck(userInfo.imageUriPath)}
                />
              </div>
              {userInfo.inWorkSpace ? (
                <p>참여중...</p>
              ) : userInfo.withdrawalType === "DONE" ? (
                <></>
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
      )}
    </div>
  );
};

export default MemberInvite;
