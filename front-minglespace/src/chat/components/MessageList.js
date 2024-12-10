import React from "react";

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message-item ${
            message.isCurrentUser ? "sender" : "received"
          }`}
        >
          {console.log(
            `Message ${index}:`,
            message,
            message.isCurrentUser ? "sender" : "received"
          )}
          <span className="message-sender">{message.sender}: </span>
          <span className="message-text">{message.text}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
