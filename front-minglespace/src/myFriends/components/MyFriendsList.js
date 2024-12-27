import React, { useCallback, useEffect, useState } from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";
import Search from "../../common/Layouts/components/Search";
import myFriendsApi from "../../api/myFriendsApi";
import Modal from "../../common/Layouts/components/Modal";
import UserInfoDetail from "../../common/Layouts/components/UserInfoDetail";
import api, { HOST_URL } from "../../api/Api";
import { getErrorMessage } from "../../common/Exception/errorUtils";
import NoData from "../../common/Layouts/components/NoData";

const MyFriendsList = ({ friends, getFriendList, handelSetFriends }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //자음체크
  const isValidKoreanCharacter = (char) => {
    const validCharRegex = /^[가-힣a-zA-Z]+$/;
    return validCharRegex.test(char);
  };

  useEffect(() => {
    if (isValidKoreanCharacter(searchKeyword) || searchKeyword === "") {
      const timer = setTimeout(() => {
        getFriendList(searchKeyword);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [getFriendList, searchKeyword]);

  //검색 핸들러
  const handleSearch = useCallback((event) => {
    setSearchKeyword(event.target.value);
  }, []);

  // 엔터 키 핸들러
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (isValidKoreanCharacter(searchKeyword) || searchKeyword === "") {
          getFriendList(searchKeyword);
        } else {
          alert("한글/영어만 조회하세요");
        }
      }
    },
    [getFriendList, searchKeyword]
  );

  //친구삭제 핸들러
  const handleDeleteFriend = useCallback(
    (friendId, event) => {
      event.stopPropagation();
      if (window.confirm("정말 삭제하시겠습니까?")) {
        myFriendsApi
          .remove(friendId)
          .then((data) => {
            handelSetFriends(data);
          })
          .catch((error) => {
            alert(`친구삭제 실패 : \n원인:+${getErrorMessage(error)}`);
          });
      }
    },
    [handelSetFriends]
  );

  //상세보기를 위한 모달기능
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  //이미지 체크함수
  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };
  return (
    <div className="section_container myFriends_container_item">
      <h1 className="section_container_title">My Friends</h1>
      {friends.length === 0 ? (
        <NoData title={"친구를 추가해보세요!"} />
      ) : (
        <div>
          <Search
            placeholder={"이름을 검색하세요"}
            onSearch={handleSearch}
            onKeyDown={handleKeyDown}
          />
          <div className="myFriends_userInfo_container">
            {friends.map((userInfo) => (
              <div
                className="myFriends_userInfo_flex myFriends_userInfo_view"
                key={userInfo.id}
                onClick={() => handleUserClick(userInfo)}
              >
                <div>
                  <Userinfo
                    name={userInfo.name}
                    role={userInfo.position}
                    email={userInfo.deleteFlag ? "unsubscribe" : userInfo.email}
                    src={imageUrlPathCheck(userInfo.profileImagePath)}
                  />
                </div>
                <button
                  className="add_button_2"
                  onClick={(event) => {
                    handleDeleteFriend(userInfo.id, event);
                  }}
                >
                  친구 삭제
                </button>
              </div>
            ))}
          </div>
          <Modal open={isModalOpen} onClose={handleCloseModal}>
            {selectedUser && (
              <UserInfoDetail
                user={selectedUser}
                isModal={true}
                src={imageUrlPathCheck(selectedUser.profileImagePath)}
              />
            )}
          </Modal>
        </div>
      )}
    </div>
  );
};

export default MyFriendsList;
