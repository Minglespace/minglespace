import React from "react";
import ChatRoom from "./components/ChatRoom";
import ChatList from "./components/ChatList";
const Chat = () => {
  const me = "user1";
  return (
    <section className="chat">
      <div className="chat_container">
        <ChatList me={me} />
        <ChatRoom />
      </div>
    </section>
  );
};

export default Chat;
