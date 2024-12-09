import MyFriendsList from "./components/MyFriendsList";
import MyFriendsSearch from "./components/MyFriendsSearch";
import MyFriendsRequest from "./components/MyFriendsRequest";
import MyFriendsPending from "./components/MyFriendsPending";

const MyFriends = () => {
  return (
    <div className="myFriends_container">
      <MyFriendsList />
      <MyFriendsSearch />
      <div className="myFriends_container_item myFriends_friendStatus_container">
        <MyFriendsRequest />
        <MyFriendsPending />
      </div>
    </div>
  );
};

export default MyFriends;
