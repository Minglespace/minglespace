import React, { useEffect, useState } from "react";
import Search from "../../common/Layouts/components/Search";
import MyFriendsApi from "../../api/myFriendsApi";
import Userinfo from "../../common/Layouts/components/Userinfo";

const userInitData = [
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
const MyFriendsSearch = ({ addFriendRequest }) => {
  const [user, setUser] = useState(...[userInitData]);
  const [searchKeyword, setSearchKeyword] = useState("");

  //유저리스트 조회용
  const getUserList = () => {
    MyFriendsApi.getUserList(searchKeyword).then((data) => {
      setUser(data);
    });
  };

  useEffect(() => {
    if (searchKeyword === "") {
      setUser([]);
    } else {
      const timer = setTimeout(() => {
        getUserList(searchKeyword);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchKeyword]);

  //검색 핸들러
  const handleSearch = (event) => {
    const value = event.target.value;
    if (isValidCharacter(value)) {
      setSearchKeyword(value);
    }
  };

  //단어체크 유효성검사
  const isValidCharacter = (char) => {
    const validCharRegex = /^[a-zA-Z0-9@.]*$/;
    return validCharRegex.test(char);
  };

  // 엔터 키 핸들러
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (isValidCharacter(searchKeyword) && searchKeyword !== "")
        getUserList(searchKeyword);
    }
  };

  //친구신청 핸들러

  const handleFriendRequest = (friendId) => {
    MyFriendsApi.friendRequest(friendId).then((data) => {
      setUser((prevUsers) => prevUsers.filter((user) => user.id !== data.id));
      addFriendRequest();
    });
  };

  return (
    <div className="section_container myFriends_container_item">
      <h1 className="section_container_title">친구를 찾아보세요.</h1>
      <Search
        placeholder={"Email을 검색하세요."}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
      />
      <div className="myFriends_userInfo_container">
        {user.map((userInfo) => (
          <div className="myFriends_userInfo_deleteButton" key={userInfo.id}>
            <Userinfo
              key={userInfo.id}
              name={userInfo.name}
              role={userInfo.position}
              email={userInfo.email}
              src={userInfo.img}
            />
            <button
              className="add_button_2"
              onClick={() => {
                handleFriendRequest(userInfo.id);
              }}
            >
              친구 신청
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MyFriendsSearch;
