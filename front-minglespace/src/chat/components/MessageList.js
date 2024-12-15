import React, { useEffect, useRef, useState } from "react";
import { FiCornerDownRight } from "react-icons/fi";
import MessageListItem from "./MessageListItem";

const MessageList = ({
  messages,
  onMessageClick,
  currentMemberInfo,
  onRegisterAnnouncement,
  onDeleteMessage
}) => {
  const [announcement, setannouncement] = useState(null);
  const messageListRef = useRef(null);
  // const safeMessages = messages || [];

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동시키는 effect
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
    // console.log(messages);
  }, [messages]);

  useEffect(() => {
    const newAnnouncement = messages.find((message) => message.isAnnouncement) || null;
    setannouncement(newAnnouncement);
    console.log("공지", newAnnouncement)
  }, [messages]);

  const registerAnnouncment = async (msg) => {
    await onRegisterAnnouncement(msg);
    setannouncement(msg);
    console.log(msg);
  }

  //부모 댓글 찾기
  const findParentMessage = (replyId) => {
    return messages.find((message) => message.id === replyId);
  }

  return (
    <div>
      {announcement && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          공지사항
          <span className="message-sender">{announcement.sender} : </span>
          <span className="message-text">{announcement.content} </span>
        </div>
      )}
      <div className="message-list" ref={messageListRef}>
        {messages.map((message) => {
          return (
            <MessageListItem
              key={message.id}
              message={message}
              isSameSender={
                // index > 0 && safeMessages[index - 1].sender === message.sender
                message.writerWsMemberId === currentMemberInfo.wsMemberId
              }
              currentMemberInfo={currentMemberInfo}
              onMessageClick={onMessageClick}
              onFindParentMessage={findParentMessage}
              onRegisterAnnouncment={registerAnnouncment}
              onDeleteMessage={onDeleteMessage}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MessageList;
//     {messages.map((message) => (
//       <div
//         key={message.id}
//         className={`message-item ${message.writerWsMemberId === currentMemberInfo.wsMemberId ? "sender" : "received"
//           }`}
//       >

//     {/* <span className="message-sender">{message.sender}: </span>
//     <span className="message-text">{message.content}</span>
