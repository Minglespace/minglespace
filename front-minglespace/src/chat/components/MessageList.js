import React from "react";

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message-item ${
            message.isCurrentUser ? "current-user" : "other-user"
          }`}
        >
          <span className="message-sender">{message.sender}: </span>

          {message.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
