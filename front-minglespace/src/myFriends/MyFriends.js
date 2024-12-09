import MyFriendsList from "./components/MyFriendsList";
import MyFriendsSearch from "./components/MyFriendsSearch";
import MyFriendsRequest from "./components/MyFriendsRequest";
import MyFriendsPending from "./components/MyFriendsPending";
import {useState} from "react";

const MyFriends = () => {
    const [friendRequest, setFriendRequest] = useState([]); // 친구 요청 상태 관리

    const addFriendRequest = (newRequest) => {
        setFriendRequest((prevRequest) => [...prevRequest, newRequest]);
    };
    return (
        <div className="myFriends_container">
            <MyFriendsList/>
            <MyFriendsSearch addFriendRequest={addFriendRequest}/>
            <div className="myFriends_container_item myFriends_friendStatus_container">
                <MyFriendsRequest friendRequest={friendRequest}/>
                <MyFriendsPending/>
            </div>
        </div>
    );
};

export default MyFriends;
