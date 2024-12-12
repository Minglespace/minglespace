import React, { useEffect, useRef, useState } from "react";

const MessageList = ({ messages, currentMemberInfo, onAnnouncement }) => {
  const [noticeMsg, setNoticeMsg] = useState(null);
  const messageListRef = useRef(null);

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동시키는 effect
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
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
      {noticeMsg && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          공지사항
          <span className="message-sender">{noticeMsg.sender}: </span>
          <span className="message-text">{noticeMsg.content} </span>
        </div>
      )
      }
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
            <span onClick={() => registerNotice(message)} style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} > 공지사항 등록</span>
          </div>
        ))}
      </div>
    </div >
  );
};

export default MessageList;
