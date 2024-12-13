import React, { useEffect, useRef, useState } from "react";

const MessageList = ({ messages, currentMemberInfo, onAnnouncement }) => {
  const [noticeMsg, setNoticeMsg] = useState(null);
  const messageListRef = useRef(null);

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동시키는 effect
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
    // console.log(messages);
  }, [messages]);

  useEffect(() => {
    const newNoticeMsg = messages.find((message) => message.isAnnouncement) || null;
    setNoticeMsg(newNoticeMsg);
  }, [messages]);

  const registerNotice = async (message) => {
    await onAnnouncement(message);
    setNoticeMsg(message);
    console.log(message);
  };


  return (
    <div>
      <div className="message-list" ref={messageListRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-item ${message.writerWsMemberId === currentMemberInfo.wsMemberId ? "sender" : "received"
              }`}
          >
            <span className="message-sender">{message.sender}: </span>
            <span className="message-text">{message.content}</span>
          </div>
        ))}
      </div>
    </div >
  );
};

export default MessageList;


