import React from "react";
import MyFriendsList from "./components/MyFriendsList";
import MyFriendsSearch from "./components/MyFriendsSearch";

const MyFriends = () => {
    return (
        <div className="myFriends_container">
            <MyFriendsList/>
            <MyFriendsSearch/>
        </div>

    );
};

export default MyFriends;
