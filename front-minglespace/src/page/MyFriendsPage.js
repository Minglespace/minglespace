import React from "react";
import BasicLayout from "../common/Layouts/BasicLayout";
import MyFriends from "../myFriends/MyFriends";

const MyFriendsPage = () => {
    return (
        <BasicLayout props="1">
          <MyFriends />
        </BasicLayout>
    );
};

export default MyFriendsPage;
