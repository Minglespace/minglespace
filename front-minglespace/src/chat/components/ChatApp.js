import React, { useState } from "react";
import { FiChevronsLeft } from "react-icons/fi";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";

// 더미 데이터
const dummyRooms = [
  {
    id: 1,
    name: "채팅방 1",
    members: ["member1", "member2"],
    messages: [{ text: "안녕하세요", sender: "member1" }],
    unreadCount: 2,
    img: "/src/asset/imgs/profile1.png",
  },
  {
    id: 2,
    name: "채팅방 2",
    members: ["member2", "member3"],
    messages: [{ text: "반갑습니다!", sender: "member3" }],
    unreadCount: 4,
    img: "/src/asset/imgs/profile1.png",
  },
  {
    id: 3,
    name: "채팅방 3",
    members: ["member3", "member4, member5"],
    messages: [{ text: "집에 가자!", sender: "member4" }],
    unreadCount: 5,
    img: "/src/asset/imgs/profile1.png",
  },
];

const ChatApp = () => {
  const [isFold, setFold] = useState(false); // 채팅방 목록을 접고 펼치는 상태.
  const [rooms, setRooms] = useState(dummyRooms);

  // 채팅방 목록을 접고 펼치는 함수
  const toggleFold = () => {
    setFold((prevFold) => !prevFold);
  };

  // 새로운 채팅방을 추가하는 함수
  const handleCreateRoom = (newRoom) => {
    setRooms((prevRooms) => [
      ...prevRooms,
      { ...newRoom, id: prevRooms.length + 1 }, // 새로운 채팅방에 고유 ID를 추가
    ]);
  };

  return (
    <div className={`chat_app ${isFold ? "folded" : ""}`}>
      {/* 채팅방 목록을 접고 펼치는 버튼 */}
      <button className="chat_toggle" onClick={toggleFold}>
        <FiChevronsLeft />
      </button>
      {/* ChatList 컴포넌트에 isFold 상태와 rooms 데이터를 전달 */}
      <ChatList isFold={isFold} rooms={rooms} />

      <ChatRoom isFold={isFold} />
    </div>
  );
};

export default ChatApp;
