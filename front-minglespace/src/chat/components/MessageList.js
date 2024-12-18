import React, { useEffect, useRef, useState } from "react";
import MessageListItem from "./MessageListItem";

const MessageList = ({ messages, onMessageClick, currentMemberInfo }) => {
  const messageListRef = useRef(null);
  // const safeMessages = messages || [];

  // 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동시키는 effect
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
    // console.log(messages);
  }, [messages]);

  //부모 댓글 찾기
  const findParentMessage = (replyId) => {
    return messages.find((message) => message.id === replyId);
  };

  // @username 형식으로 멘션을 인식하고 표시하는 함수
  const parseMessage = (message) => {
    const regex = /@(\w+)/g;
    console.log("Parsing message: ", message); // 메시지 파싱 확인
    // @username 형식으로 멘션을 인식하고 표시
    return message.split(regex).map((part, index) =>
      regex.test(`@${part}`) ? (
        <strong key={index} style={{ color: "blue", fontWeight: "bold" }}>
          @{part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
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
            parsedMessage={parseMessage(message.content)}
          />
        );
      })}
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
