import React from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatRoom = ({ isFold }) => {
  return (
    <div className={`chatroom_container ${isFold ? "folded" : ""}`}>
      <ChatRoomHeader />
      <div className="chat_messages">
        {/* 여기에 채팅 메시지들이 들어갑니다 */}

        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatRoom;
