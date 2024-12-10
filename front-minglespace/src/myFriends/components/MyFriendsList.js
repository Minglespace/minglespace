import React, { useEffect, useState } from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";
import Search from "../../common/Layouts/components/Search";
import myFriendsApi from "../../api/myFriendsApi";
import Modal from "../../common/Layouts/components/Modal";
import UserInfoDetail from "../../common/Layouts/components/UserInfoDetail";

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
const MyFriendsList = ({ friends, getFriendList, handelSetFriends }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isValidKoreanCharacter(searchKeyword) || searchKeyword === "") {
      const timer = setTimeout(() => {
        getFriendList(searchKeyword);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchKeyword]);

  //검색 핸들러
  const handleSearch = (event) => {
    setSearchKeyword(event.target.value);
  };

  // 엔터 키 핸들러
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      getFriendList(searchKeyword);
    }
  };

  //자음체크
  const isValidKoreanCharacter = (char) => {
    const validCharRegex = /^[가-힣a-zA-Z]+$/;
    return validCharRegex.test(char);
  };

  //친구삭제 핸들러
  const handleDeleteFriend = (friendId) => {
    myFriendsApi.remove(friendId).then((data) => {
      handelSetFriends(data);
    });
  };

  //상세보기를 위한 모달기능
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="section_container myFriends_container_item">
      <h1 className="section_container_title">My Friends</h1>
      <Search
        placeholder={"이름을 검색하세요"}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
      />
      <div className="myFriends_userInfo_container">
        {friends.map((userInfo) => (
          <div className="myFriends_userInfo_deleteButton" key={userInfo.id}>
            <div
              className="myFriends_userInfo_view"
              onClick={() => handleUserClick(userInfo)}
            >
              <Userinfo
                name={userInfo.name}
                role={userInfo.position}
                email={userInfo.email}
                src={userInfo.img}
                onClick={() => handleUserClick(userInfo)}
              />
            </div>
            <button
              className="add_button_2"
              onClick={() => {
                handleDeleteFriend(userInfo.id);
              }}
            >
              친구 삭제
            </button>
          </div>
        ))}
      </div>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        {selectedUser && <UserInfoDetail user={selectedUser} />}
      </Modal>
    </div>
  );
};

export default MyFriendsList;
