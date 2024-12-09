import React, {useEffect, useState} from "react";
import MyFriendsApi from "../../api/myFriendsApi";

const userInitData = [
    {
        id: 0,
        email: "",
        position: "",
        name: "",
    },
];

const MyFriendsRequest = () => {
  const [user, setUser] = useState([...userInitData]);
    useEffect(() => {
        MyFriendsApi.friendRequestList().then((data) =>{
            setUser(data);
        })
    }, []);
  return (
    <div className="section_container myFriends_container_item myFriends_friendStatus_item">
      <h2 className="section_container_title">친구 수락 대기중...</h2>
        <div className="myFriends_request_userInfo">
        {
            user.map((userInfo)=>(
                <div key={userInfo.id} className="myFriend_request_info">
                    <div>
                       <p><b>{userInfo.name}</b> ({userInfo.position})</p>
                       <p>{userInfo.email}</p>
                    </div>
                    <p>상대방 수락 대기중...</p>
                </div>
            ))
        }
        </div>
    </div>
  );
};

export default MyFriendsRequest;
