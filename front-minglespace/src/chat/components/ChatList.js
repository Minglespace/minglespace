import React, { useState } from "react";
import ChatListItem from "./ChatListItem";
import CreateChatRoomModal from "./CreateChatRoomModal";
import { IoLogoWechat } from "react-icons/io5";
import { useChatApp } from "../context/ChatAppContext";

const ChatList = ({
  isFold
}) => {
  const {roomsState} = useChatApp();
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const getTotalUnreadMessages = () => {
    return roomsState.reduce((total, room) => total + (room.notReadMsgCount || 0), 0);
  }
  const totalUnreadMessages = getTotalUnreadMessages();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className={`chat_list_container ${isFold ? "collapsed" : ""}`}>
        {!isFold && <h1>채팅방 목록</h1>}
        <div className={`unread-msgCount ${totalUnreadMessages === 0 ? "zero-msgCount" : "valid-msgCount"}`}>
          < p > 안 읽은 메시지: {getTotalUnreadMessages()}</p>
        </div>
        {roomsState && roomsState.length === 0 ? (
          <div className="no-chatroom-selected">
            <IoLogoWechat />
            <p>채팅방이 없습니다. </p>
            <p>채팅방을 생성해주세요.</p>
          </div>
        ) : (
          roomsState.map((room) => (
            <ChatListItem
              key={room.chatRoomId}
              chat={room}
            />
          ))
        )}
        <button className="create_button" onClick={openModal}>
          +
        </button>
        <CreateChatRoomModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div >
    </div >
  );
};

export default ChatList;
