import React from "react";

const MessageList = ({ messages, currentMemberInfo }) => {
  console.log("messagelist_ mesg; ", messages);

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-item ${message.writerWsMemberId === currentMemberInfo.wsMemberId ? "sender" : "received"
            }`}
        >
          {console.log(
            `Message ${message.id}:`,
            message,
            message.writerWsMemberId === currentMemberInfo.wsMemberId ? "sent" : "received"
          )}
          <span className="message-sender">{message.sender}: </span>
          <span className="message-text">{message.content}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
