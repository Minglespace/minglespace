import React, { useEffect, useRef } from "react";

const MessageList = ({ messages, currentMemberInfo }) => {
  // console.log("messagelist_ mesg; ", messages);
  const messageListRef = useRef(null);

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동시키는 effect
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="message-list" ref={messageListRef}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-item ${message.writerWsMemberId === currentMemberInfo.wsMemberId ? "sender" : "received"
            }`}
        >
          {/* {console.log(
            `Message ${message.id}:`,
            message,
            message.writerWsMemberId === currentMemberInfo.wsMemberId ? "sent" : "received"
          )} */}
          <span className="message-sender">{message.sender}: </span>
          <span className="message-text">{message.content}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
