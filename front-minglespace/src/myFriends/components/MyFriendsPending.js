import React, { useCallback } from "react";
import MyFriendsApi from "../../api/myFriendsApi";
import { getErrorMessage } from "../../common/Exception/errorUtils";
import NoData from "../../common/Layouts/components/NoData";

const MyFriendsPending = ({ friendPending, refuseFriend, acceptFriend }) => {
  //친구 거절핸들러
  const handleFriendRefuse = (friendId) => {
    MyFriendsApi.refuseFriend(friendId)
      .then((data) => {
        refuseFriend(data);
      })
      .catch((error) => {
        alert(`친구거절 실패 : \n원인:+${getErrorMessage(error)}`);
      });
  };

  //친구 수락핸들러
  const handleFriendAccept = (friendId) => {
    MyFriendsApi.acceptFriend(friendId)
      .then((data) => {
        acceptFriend(data);
      })
      .catch((error) => {
        alert(`친구수락 실패 : \n원인:+${getErrorMessage(error)}`);
      });
  };

  return (
    <div className="section_container myFriends_container_item myFriends_friendStatus_item">
      <h2 className="section_container_title">친구 요청을 수락하세요!</h2>
      <div className="myFriends_request_userInfo">
        {friendPending.length === 0 ? (
          <NoData title={"요청 온 친구가 없습니다"} />
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
                className="delete_button"
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
