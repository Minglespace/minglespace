import React, { useCallback, useEffect, useRef, useState } from "react";
import Search from "../../common/Layouts/components/Search";
import MyFriendsApi from "../../api/myFriendsApi";
import Userinfo from "../../common/Layouts/components/Userinfo";

const MyFriendsSearch = ({ addFriendRequest }) => {
  const [user, setUser] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [Loading, setLoading] = useState(false);
  const observer = useRef();

  //유저리스트 조회용
  const getUserList = async (keyword, pageNum) => {
    setLoading(true);
    const response = await MyFriendsApi.getUserList(searchKeyword, pageNum, 10);
    if (pageNum === 0) {
      setUser(response.content);
    } else {
      setUser((prevUsers) => [...prevUsers, ...response.content]);
    }

    setHasMore(!response.last);
    setLoading(false);
  };

  useEffect(() => {
    setUser([]);
    setPage(0);
    if (searchKeyword !== "") {
      const timer = setTimeout(() => {
        getUserList(searchKeyword, 0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchKeyword]);

  useEffect(() => {
    if (page > 0 && searchKeyword !== "") {
      getUserList(searchKeyword, page);
    }
  }, [page]);

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
      if (isValidCharacter(searchKeyword) && searchKeyword !== "") {
        setUser([]);
        setPage(0);
        getUserList(searchKeyword, 0);
      }
    }
  };

  //친구신청 핸들러
  const handleFriendRequest = (friendId) => {
    MyFriendsApi.friendRequest(friendId).then((data) => {
      setUser((prevUsers) => prevUsers.filter((user) => user.id !== data.id));
      addFriendRequest();
    });
  };

  //마지막 요소를 관찰하여 페이지 번호 증가
  const lastUserElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );
  return (
    <div className="section_container myFriends_container_item">
      <h1 className="section_container_title">친구를 찾아보세요.</h1>
      <Search
        placeholder={"Email을 검색하세요."}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
      />
      <div className="myFriends_userInfo_container">
        {user.map((userInfo, index) => (
          <div
            className="myFriends_userInfo_deleteButton"
            key={`${userInfo.id}-${index}`}
            ref={index === user.length - 1 ? lastUserElementRef : null}
          >
            <Userinfo
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
        {Loading && <p>Loading 중입니다...</p>}
        {}
      </div>
    </div>
  );
};
export default MyFriendsSearch;
