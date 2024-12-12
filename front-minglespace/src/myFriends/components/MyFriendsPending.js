import React, { useCallback } from "react";
import MyFriendsApi from "../../api/myFriendsApi";

const MyFriendsPending = ({ friendPending, refuseFriend, acceptFriend }) => {
  //친구 거절핸들러
  const handleFriendRefuse = useCallback(
    (friendId) => {
      MyFriendsApi.refuseFriend(friendId).then((data) => {
        refuseFriend(data);
      });
    },
    [refuseFriend]
  );
  //친구 수락핸들러
  const handleFriendAccept = useCallback(
    (friendId) => {
      MyFriendsApi.acceptFriend(friendId).then((data) => {
        acceptFriend(data);
      });
    },
    [acceptFriend]
  );

  return (
    <div className="section_container myFriends_container_item myFriends_friendStatus_item">
      <h2 className="section_container_title">친구 요청을 수락하세요!</h2>
      <div className="myFriends_request_userInfo">
        {friendPending.length === 0 ? (
          <p>요청 온 목록이 없습니다</p>
        ) : (
          friendPending.map((userInfo) => (
            <div key={userInfo.id} className="myFriend_request_info">
              <div>
                <p>
                  <b>{userInfo.name}</b> ({userInfo.position})
                </p>
                <p>{userInfo.email}</p>
              </div>
              <button
                className="add_button_2"
                onClick={() => {
                  handleFriendAccept(userInfo.id);
                }}
              >
                수락
              </button>
              <button
                className="add_button_2"
                onClick={() => {
                  handleFriendRefuse(userInfo.id);
                }}
              >
                거절
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyFriendsPending;
