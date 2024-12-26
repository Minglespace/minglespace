import React, { useEffect, useRef, useState } from "react";
import { FiChevronsLeft } from "react-icons/fi";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import { useLocation } from "react-router-dom";
import { IoLogoWechat } from "react-icons/io5";
import { useChatApp } from "../context/ChatAppContext";

// const initRooms = [{
//   chatRoomId: 0,
//   name: "",
//   imageUriPath: "",
//   participantCount: 0,
//   lastMessage: "",
//   date: "",
//   notReadMsgCount: 0
// }];

// const initMembers = [
//   {
//     wsMemberId: 0,
//     userId: 0,
//     email: "",
//     name: "",
//     imageUriPath: "",
//     position: "",
//   },
// ];

const ChatApp = () => {
  const { fetchChatRooms, fetchWsMembers, chatRoomId, setChatRoomId, workspaceId } = useChatApp();

  const [isFold, setFold] = useState(false); // 채팅방 목록을 접고 펼치는 상태.
  const location = useLocation();


  useEffect(() => {
    const chatRoomId = new URLSearchParams(location.search).get("chatRoomId");
    console.log("쿼리 변화 감지 하고 있니, ", chatRoomId);
    setChatRoomId(chatRoomId);
  }, [location.search, location.pathname, setChatRoomId]);


  useEffect(() => {
    fetchChatRooms();
    fetchWsMembers();
  }, [workspaceId]);


  const toggleFold = () => {
    setFold((prevFold) => !prevFold);
  };

  return (
    <div className={`chat_app ${isFold ? "folded" : ""}`}>
      <button className="chat_toggle" onClick={toggleFold}>
        <FiChevronsLeft />
      </button>
      <ChatList
        isFold={isFold}
      />
      {chatRoomId === null ? (
        <div className="no-chat-selected">
          <IoLogoWechat />
          <span>채팅방을 선택해주세요.</span>
        </div>
      ) : (
        <ChatRoom
          isFold={isFold}
        />
      )}
    </div>
  );
};

export default ChatApp;
