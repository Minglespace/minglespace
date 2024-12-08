import React, { useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatRoom = ({ isFold }) => {
  const [messages, setMessages] = useState([
    { sender: "Alice", text: "Hello!", isCurrentUser: false },
    { sender: "Bob", text: "Hi!", isCurrentUser: false },
  ]);

  const [newMessage, setNewMessage] = useState("");

  // 메시지 전송 처리 함수
  const handleSendMessage = (newMessage) => {
    // 새로운 메시지 객체를 추가
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", text: newMessage, isCurrentUser: true },
    ]);
    console.log(messages);
  };

  return (
    <div className={`chatroom-container ${isFold ? "folded" : ""}`}>
      <ChatRoomHeader />
      <div className="chat-messages">
        {/* 여기에 채팅 메시지들이 들어갑니다 */}
        <MessageList messages={messages} /> {/* 전송된 메시지 목록 표시 */}
        <MessageInput onSendMessage={handleSendMessage} />
        {/* 메시지 전송 처리 */}
      </div>
    </div>
  );
};

export default ChatRoom;
