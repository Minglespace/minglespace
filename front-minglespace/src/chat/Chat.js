import React from "react";
import ChatRoom from "./components/ChatRoom";
import ChatList from "./components/ChatList";
const Chat = () => {
  return (
    <section className="chat">
      <div className="chat_container">
        <ChatList />
        <ChatRoom />
      </div>
    </section>
  );
};

export default Chat;
