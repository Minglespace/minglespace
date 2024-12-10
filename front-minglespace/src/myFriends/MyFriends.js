import MyFriendsList from "./components/MyFriendsList";
import MyFriendsSearch from "./components/MyFriendsSearch";
import MyFriendsRequest from "./components/MyFriendsRequest";
import MyFriendsPending from "./components/MyFriendsPending";
import { useEffect, useState } from "react";
import MyFriendsApi from "../api/myFriendsApi";

const friendInit = [
  {
    id: 0,
    email: "",
    name: "",
    phone: "",
    introduction: "",
    position: "",
    img: "",
  },
];

const MyFriends = () => {
  const [friendRequest, setFriendRequest] = useState([...friendInit]); // 친구 요청 상태 관리
  const [friendPending, setFriendPending] = useState([...friendInit]); // 친구 대기 상태 관리
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true); //로딩 상태관리

  //친구리스트 조회용
  const getFriendList = (searchKeyword) => {
    MyFriendsApi.getList(searchKeyword).then((data) => {
      setFriends(data);
      setLoading(false);
    });
  };
  //친구 요청 조회용
  const getFriendRequestList = () => {
    MyFriendsApi.friendRequestList().then((data) => {
      setFriendRequest(data);
    });
  };
  //친구 대기 조회용
  const getFriendPendingList = () => {
    MyFriendsApi.friendPendingList().then((data) => {
      setFriendPending(data);
    });
  };
  //친구 최신화 핸들러
  const handelSetFriends = (data) => {
    setFriends(data);
  };

  useEffect(() => {
    getFriendList();
    getFriendRequestList();
    getFriendPendingList();
  }, []);

  const addFriendRequest = () => {
    getFriendRequestList();
  };

  const refuseFriend = (data) => {
    setFriendPending(data);
  };

  const acceptFriend = (data) => {
    setFriendPending(data);
    getFriendList();
  };

  return (
    <div className="myFriends_container">
      {loading ? (
        <p>로딩 중입니다....</p>
      ) : (
        <>
          <MyFriendsList
            friends={friends}
            getFriendList={getFriendList}
            handelSetFriends={handelSetFriends}
          />
          <MyFriendsSearch addFriendRequest={addFriendRequest} />
          <div className="myFriends_container_item myFriends_friendStatus_container">
            <MyFriendsRequest friendRequest={friendRequest} />
            <MyFriendsPending
              friendPending={friendPending}
              refuseFriend={refuseFriend}
              acceptFriend={acceptFriend}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default MyFriends;
