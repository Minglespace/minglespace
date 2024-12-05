import React, { useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatRoom = ({ isFold }) => {
  const [message, setMessages] = useState([]);

  const handleSendMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };
  return (
    <div className={`chatroom_container ${isFold ? "folded" : ""}`}>
      <ChatRoomHeader />
      <div className="chat_messages">
        {/* 여기에 채팅 메시지들이 들어갑니다 */}
        <MessageList messages={message} /> {/* 전송된 메시지 목록 표시 */}
        <MessageInput onSendMessage={handleSendMessage} />
        {/* 메시지 전송 처리 */}
      </div>
    </div>
  );
};

export default ChatRoom;
